/* eslint-disable unicorn/no-process-exit */
/* eslint-disable unicorn/no-thenable */
import jsonFile from 'jsonfile';

import {
  AppError,
  GuruMeditationError,
  InvalidAppEnvironmentError
} from 'named-app-errors';

import { debugNamespace as namespace } from 'universe/constants';
import { getEnv } from 'universe/backend/env';

import { getDb } from 'multiverse/mongo-schema';
import { debugFactory } from 'multiverse/debug-extended';

const debugNamespace = `${namespace}:log-stats`;
const cachePath = `${__dirname}/log-stats-cache.json`;

const log = debugFactory(debugNamespace);
const debug = debugFactory(`${debugNamespace}:debug`);

// eslint-disable-next-line no-console
log.log = console.info.bind(console);

// ? Ensure this next line survives Webpack
if (!globalThis.process.env.DEBUG && getEnv().NODE_ENV !== 'test') {
  debugFactory.enable(
    `${debugNamespace},${debugNamespace}:*,-${debugNamespace}:debug`
  );
}

/**
 * Pores over request-log entries and drops the ban hammer on rule breaking
 * clients.
 */
const invoked = async () => {
  try {
    if (!getEnv().MONGODB_URI) {
      throw new InvalidAppEnvironmentError(
        'MONGODB_URI must be a valid mongodb connection string'
      );
    }

    let show404s = false;

    if (globalThis.process.argv.includes('--show-404s')) {
      show404s = true;
    }

    log(`compiling statistics (404s ${show404s ? 'shown' : 'hidden'})...`);

    const previousResults: Record<string, number> = await (async () => {
      try {
        debug(`reading in results from cache at ${cachePath}`);
        return await jsonFile.readFile(cachePath);
      } catch {
        return {};
      }
    })();

    debug('previous results: %O', previousResults);

    const db = await getDb({ name: 'root' });
    const requestLogDb = db.collection('request-log');
    const limitedLogDb = db.collection('limited-log');

    const requestLogPipeline = [
      {
        $facet: {
          // ? Select the latest timestamp per (header)
          group_header_x_latest: [
            {
              $group: {
                _id: '$header',
                latestAt: { $max: '$createdAt' }
              }
            }
          ],
          // ? Count requests per (header)
          group_header: [
            {
              $group: {
                _id: '$header',
                totalRequests: { $sum: 1 },
                preflightRequests: {
                  $sum: {
                    $cond: { if: { $eq: ['$method', 'OPTIONS'] }, then: 1, else: 0 }
                  }
                },
                normalRequests: {
                  $sum: {
                    $cond: { if: { $eq: ['$method', 'OPTIONS'] }, then: 0, else: 1 }
                  }
                }
              }
            }
          ],
          // ? Count requests per (header, ip)
          group_header_x_ip: [
            {
              $group: {
                _id: { header: '$header', ip: '$ip' },
                requests: { $sum: 1 }
              }
            },
            {
              $group: {
                _id: '$_id.header',
                ips: {
                  $push: {
                    ip: '$_id.ip',
                    requests: '$requests'
                  }
                }
              }
            }
          ],
          // ? Count requests per (header, method)
          group_header_x_method: [
            {
              $group: {
                _id: { header: '$header', method: '$method' },
                requests: { $sum: 1 }
              }
            },
            {
              $group: {
                _id: '$_id.header',
                methods: {
                  $push: {
                    method: '$_id.method',
                    requests: '$requests'
                  }
                }
              }
            }
          ],
          // ? Count requests per (header, status)
          group_header_x_status: [
            {
              $group: {
                _id: { header: '$header', status: '$resStatusCode' },
                requests: { $sum: 1 }
              }
            },
            {
              $group: {
                _id: '$_id.header',
                statuses: {
                  $push: {
                    status: '$_id.status',
                    requests: '$requests'
                  }
                }
              }
            }
          ],
          // ? Count requests per (header, endpoint)
          group_header_x_endpoints: [
            {
              $group: {
                _id: {
                  header: '$header',
                  endpoint: {
                    $cond: {
                      if: { $not: ['$endpoint'] },
                      then: '<data missing>',
                      else: '$endpoint'
                    }
                  }
                },
                requests: { $sum: 1 }
              }
            },
            {
              $group: {
                _id: '$_id.header',
                endpoints: {
                  $push: {
                    endpoint: '$_id.endpoint',
                    requests: '$requests'
                  }
                }
              }
            }
          ]
        }
      },

      // ? Merge stats into per-header documents
      {
        $project: {
          headerStats: {
            $concatArrays: [
              '$group_header_x_latest',
              '$group_header',
              '$group_header_x_ip',
              '$group_header_x_method',
              '$group_header_x_status',
              '$group_header_x_endpoints'
            ]
          }
        }
      },
      {
        $unwind: '$headerStats'
      },
      {
        $group: {
          _id: '$headerStats._id',
          stats: { $mergeObjects: '$$ROOT.headerStats' }
        }
      },
      {
        $replaceRoot: { newRoot: '$stats' }
      },

      // ? Sort results by greatest number of requests
      {
        $sort: { normalRequests: -1 }
      },

      // ? Add relevant fields
      {
        $addFields: {
          header: '$_id',
          token: { $arrayElemAt: [{ $split: ['$_id', ' '] }, 1] }
        }
      },

      // ? Cross-reference tokens with identity data
      {
        $lookup: {
          from: 'auth',
          localField: 'token',
          foreignField: 'token.bearer',
          as: 'auth'
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ['$auth', 0] }, '$$ROOT']
          }
        }
      },

      // ? Beautify output
      {
        $addFields: {
          owner: { $ifNull: ['$attributes.owner', '<unauthenticated>'] },
          token: {
            $cond: {
              if: { $gt: ['$attributes.owner', null] },
              then: { $ifNull: ['$token', '<none>'] },
              else: '<unauthenticated>'
            }
          }
        }
      },
      {
        $project: {
          _id: false,
          attributes: false,
          auth: false,
          scheme: false
        }
      }
    ];

    // ? Calculates duration percentiles: fastest, 50%, 90%, 95%, 99%, 99.9%,
    // ? and slowest
    const requestPercentilePipeline = [
      { $match: { durationMs: { $exists: true } } },
      { $sort: { durationMs: 1 } },
      {
        $addFields: {
          endpoint: { $ifNull: ['$endpoint', '<no endpoint>'] },
          resStatusCode: { $ifNull: ['$resStatusCode', '<no status>'] },
          method: { $ifNull: ['$method', '<no method>'] }
        }
      },
      {
        $group: {
          _id: null,
          durations: { $push: '$durationMs' },
          endpoints: { $push: '$endpoint' },
          statuses: { $push: '$resStatusCode' },
          methods: { $push: '$method' }
        }
      },
      {
        $addFields: {
          index_50: { $floor: { $multiply: [0.5, { $size: '$durations' }] } },
          index_90: { $floor: { $multiply: [0.9, { $size: '$durations' }] } },
          index_95: { $floor: { $multiply: [0.95, { $size: '$durations' }] } },
          index_99: { $floor: { $multiply: [0.99, { $size: '$durations' }] } },
          index_999: { $floor: { $multiply: [0.999, { $size: '$durations' }] } },
          index_9999: { $floor: { $multiply: [0.9999, { $size: '$durations' }] } }
        }
      },
      {
        $project: {
          _id: false,
          fastest: {
            duration: { $arrayElemAt: ['$durations', 0] },
            endpoint: { $arrayElemAt: ['$endpoints', 0] },
            status: { $arrayElemAt: ['$statuses', 0] },
            method: { $arrayElemAt: ['$methods', 0] }
          },
          percentile_50: {
            duration: { $arrayElemAt: ['$durations', '$index_50'] },
            endpoint: { $arrayElemAt: ['$endpoints', '$index_50'] },
            status: { $arrayElemAt: ['$statuses', '$index_50'] },
            method: { $arrayElemAt: ['$methods', '$index_50'] }
          },
          percentile_90: {
            duration: { $arrayElemAt: ['$durations', '$index_90'] },
            endpoint: { $arrayElemAt: ['$endpoints', '$index_90'] },
            status: { $arrayElemAt: ['$statuses', '$index_90'] },
            method: { $arrayElemAt: ['$methods', '$index_90'] }
          },
          percentile_95: {
            duration: { $arrayElemAt: ['$durations', '$index_95'] },
            endpoint: { $arrayElemAt: ['$endpoints', '$index_95'] },
            status: { $arrayElemAt: ['$statuses', '$index_95'] },
            method: { $arrayElemAt: ['$methods', '$index_95'] }
          },
          percentile_99: {
            duration: { $arrayElemAt: ['$durations', '$index_99'] },
            endpoint: { $arrayElemAt: ['$endpoints', '$index_99'] },
            status: { $arrayElemAt: ['$statuses', '$index_99'] },
            method: { $arrayElemAt: ['$methods', '$index_99'] }
          },
          percentile_999: {
            duration: { $arrayElemAt: ['$durations', '$index_999'] },
            endpoint: { $arrayElemAt: ['$endpoints', '$index_999'] },
            status: { $arrayElemAt: ['$statuses', '$index_999'] },
            method: { $arrayElemAt: ['$methods', '$index_999'] }
          },
          percentile_9999: {
            duration: { $arrayElemAt: ['$durations', '$index_9999'] },
            endpoint: { $arrayElemAt: ['$endpoints', '$index_9999'] },
            status: { $arrayElemAt: ['$statuses', '$index_9999'] },
            method: { $arrayElemAt: ['$methods', '$index_9999'] }
          },
          slowest: {
            duration: { $arrayElemAt: ['$durations', -1] },
            endpoint: { $arrayElemAt: ['$endpoints', -1] },
            status: { $arrayElemAt: ['$statuses', -1] },
            method: { $arrayElemAt: ['$methods', -1] }
          }
        }
      }
    ];

    const limitedLogPipeline = [
      {
        $project: {
          _id: false,
          header: true,
          token: { $arrayElemAt: [{ $split: ['$header', ' '] }, 1] },
          ip: true,
          until: true
        }
      },
      {
        $lookup: {
          from: 'auth',
          localField: 'token',
          foreignField: 'token.bearer',
          as: 'auth'
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ['$auth', 0] }, '$$ROOT']
          }
        }
      },
      {
        $project: {
          owner: { $ifNull: ['$attributes.owner', '<unauthenticated>'] },
          token: {
            $cond: {
              if: { $gt: ['$attributes.owner', null] },
              then: { $ifNull: ['$token', '<none>'] },
              else: '<unauthenticated>'
            }
          },
          header: true,
          ip: true,
          until: true,
          dummy: true
        }
      },
      {
        $sort: { until: -1, _id: -1 }
      },
      {
        $project: {
          _id: false,
          dummy: false
        }
      }
    ];

    const byRequests = (a: { requests: number }, b: { requests: number }) =>
      b.requests - a.requests;

    debug('running request-log aggregation pipeline: %O', requestLogPipeline);

    const requestLogCursor = requestLogDb.aggregate<{
      owner: string;
      token: string;
      header: string | null;
      normalRequests: number;
      preflightRequests: number;
      totalRequests: number;
      ips: { ip: string; requests: number }[];
      statuses: { status: number; requests: number }[];
      methods: { method: string; requests: number }[];
      endpoints: { endpoint: string; requests: number }[];
      latestAt: number;
    }>(requestLogPipeline);

    const requestLogStats = await requestLogCursor.toArray();

    debug(
      'running request-log percentile aggregation pipeline: %O',
      requestPercentilePipeline
    );

    const percentileCursor = requestLogDb.aggregate<{
      fastest: Percentile;
      percentile_50: Percentile;
      percentile_90: Percentile;
      percentile_95: Percentile;
      percentile_99: Percentile;
      percentile_999: Percentile;
      percentile_9999: Percentile;
      slowest: Percentile;
    }>(requestPercentilePipeline);

    const requestPercentiles = await percentileCursor.next();

    debug('running limited-log aggregation pipeline: %O', limitedLogPipeline);

    const limitedLogCursor = limitedLogDb.aggregate<{
      owner?: string;
      token?: string;
      header?: string | null;
      ip?: string;
      until: number;
    }>(limitedLogPipeline);

    const limitedLogStats = await limitedLogCursor.toArray();

    debug('closing cursors');

    await Promise.all([
      requestLogCursor.close(),
      percentileCursor.close(),
      limitedLogCursor.close()
    ]);

    const chalk = (await import('chalk')).default;
    const outputStrings: string[] = [];

    const addAuthInfo = (
      owner: string,
      token: string,
      header: string | null,
      error = false
    ) => {
      outputStrings.push(
        `  owner: ${
          owner === '<unauthenticated>'
            ? chalk.gray(owner)
            : chalk[error ? 'red' : 'green'].bold(owner)
        }`,
        `  token: ${token === '<unauthenticated>' ? chalk.gray(token) : token}`,
        `  header: ${header ?? chalk.gray(header)}`
      );
    };

    debug('compiling output');
    debug(`requestLogStats.length=${requestLogStats.length}`);
    debug(`limitedLogStats.length=${limitedLogStats.length}`);
    debug('requestPercentiles=%O', requestPercentiles);

    outputStrings.push(`\n::REQUEST LOG::${requestLogStats.length ? '\n' : ''}`);

    if (!requestLogStats.length) {
      outputStrings.push('  <request-log collection is empty>');
      Object.keys(previousResults).forEach((k) => {
        delete previousResults[k];
      });
    } else {
      requestLogStats.forEach(
        ({
          owner,
          token,
          header,
          normalRequests,
          preflightRequests,
          totalRequests,
          ips,
          methods,
          endpoints,
          statuses,
          latestAt
        }) => {
          addAuthInfo(owner, token, header);

          const headerString = String(header);
          const delta = previousResults[headerString]
            ? normalRequests - previousResults[headerString]
            : null;

          previousResults[headerString] = normalRequests;

          outputStrings.push(
            `  total requests: ${
              preflightRequests
                ? `${normalRequests} (+${preflightRequests} preflight, ${totalRequests} total)`
                : totalRequests
            }${
              delta !== null
                ? chalk.yellow(` (Δ${delta >= 0 ? `+${delta}` : delta})`)
                : ''
            }`,
            `  most recent request: ${new Date(latestAt).toLocaleString()}`,
            '  requests by ip:'
          );

          ips.forEach(({ ip, requests: requestsFromIp }) =>
            outputStrings.push(`    ${ip} - ${requestsFromIp} requests`)
          );

          outputStrings.push('  requests by HTTP status code:');

          statuses
            .sort(byRequests)
            .forEach(({ status, requests: requestResponseStatus }) => {
              const str = `    ${status} - ${requestResponseStatus} requests`;
              outputStrings.push(status === 429 ? chalk.red(str) : str);
            });

          outputStrings.push('  requests by HTTP method:');

          methods
            .sort(byRequests)
            .forEach(({ method, requests: requestsOfMethod }) => {
              const str = `    ${method} - ${requestsOfMethod} requests`;
              outputStrings.push(method === 'OPTIONS' ? chalk.gray(str) : str);
            });

          outputStrings.push('  requests by endpoint:');

          const _404Array: string[] = [];

          endpoints
            .sort(byRequests)
            .forEach(({ endpoint, requests: requestsToEndpoint }) => {
              const str = `    ${endpoint} - ${requestsToEndpoint} requests`;

              if (endpoint.startsWith('404:')) {
                _404Array.push(str);
              } else {
                outputStrings.push(
                  endpoint === '<data missing>' ? chalk.gray(str) : str
                );
              }
            });

          if (_404Array.length) {
            if (show404s) {
              _404Array.forEach((str) => outputStrings.push(chalk.gray(str)));
            } else {
              outputStrings.push(
                chalk.gray(
                  `    [${_404Array.length} 404s elided, use --show-404s to view]`
                )
              );
            }
          }

          outputStrings.push('');
        }
      );

      outputStrings.push(
        '  :PERCENTILES:',
        `   fastest: ${
          requestPercentiles?.fastest !== undefined
            ? percentileToString(requestPercentiles.fastest)
            : '<data missing>'
        }`,
        `     50%<=: ${
          requestPercentiles?.percentile_50 !== undefined
            ? percentileToString(requestPercentiles.percentile_50)
            : '<data missing>'
        }`,
        `     90%<=: ${
          requestPercentiles?.percentile_90 !== undefined
            ? percentileToString(requestPercentiles.percentile_90)
            : '<data missing>'
        }`,
        `     95%<=: ${
          requestPercentiles?.percentile_95 !== undefined
            ? percentileToString(requestPercentiles.percentile_95)
            : '<data missing>'
        }`,
        `     99%<=: ${
          requestPercentiles?.percentile_99 !== undefined
            ? percentileToString(requestPercentiles.percentile_99)
            : '<data missing>'
        }`,
        `   99.9%<=: ${
          requestPercentiles?.percentile_999 !== undefined
            ? percentileToString(requestPercentiles.percentile_999)
            : '<data missing>'
        }`,
        `  99.99%<=: ${
          requestPercentiles?.percentile_9999 !== undefined
            ? percentileToString(requestPercentiles.percentile_9999)
            : '<data missing>'
        }`,
        `   slowest: ${
          requestPercentiles?.slowest !== undefined
            ? percentileToString(requestPercentiles.slowest)
            : '<data missing>'
        }`
      );
    }

    outputStrings.push(`\n::LIMIT LOG::${limitedLogStats.length ? '\n' : ''}`);

    if (!limitedLogStats.length) {
      outputStrings.push('  <limited-log collection is empty>');
    } else {
      limitedLogStats.forEach(({ owner, token, header, ip, until }) => {
        const now = Date.now();
        const banned = until > now;

        if (owner && token && header !== undefined) {
          addAuthInfo(owner, token, header, banned);
        } else if (ip) {
          outputStrings.push(`  ip: ${ip}`);
        } else {
          throw new GuruMeditationError('encountered malformed limit log data');
        }

        outputStrings.push(
          `  status: ${
            !banned
              ? chalk.gray('expired')
              : chalk.red.bold(
                  `banned until ${new Date(until - now).toLocaleString()}`
                )
          }`,
          ''
        );
      });
    }

    log(outputStrings.join('\n'));

    debug(`writing out results to cache at ${cachePath}`);
    await jsonFile.writeFile(cachePath, previousResults);

    log('execution complete');
    process.exit(0);
  } catch (error) {
    throw new AppError(`${error}`);
  }
};

export default invoked().catch((error: Error) => {
  log.error(error.message);
  process.exit(2);
});

type Percentile = {
  duration: number;
  endpoint: number;
  status: number;
  method: number;
};

function percentileToString(percentile: Percentile): string {
  return `${percentile.duration}ms\t${percentile.method}\t${percentile.status}\t${percentile.endpoint}`;
}
