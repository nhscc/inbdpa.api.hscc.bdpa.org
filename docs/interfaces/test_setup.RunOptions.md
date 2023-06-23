[inbdpa.api.hscc.bdpa.org](../README.md) / [test/setup](../modules/test_setup.md) / RunOptions

# Interface: RunOptions

[test/setup](../modules/test_setup.md).RunOptions

## Hierarchy

- `Options`

  ↳ **`RunOptions`**

## Table of contents

### Properties

- [all](test_setup.RunOptions.md#all)
- [argv0](test_setup.RunOptions.md#argv0)
- [buffer](test_setup.RunOptions.md#buffer)
- [cleanup](test_setup.RunOptions.md#cleanup)
- [cwd](test_setup.RunOptions.md#cwd)
- [detached](test_setup.RunOptions.md#detached)
- [encoding](test_setup.RunOptions.md#encoding)
- [env](test_setup.RunOptions.md#env)
- [execPath](test_setup.RunOptions.md#execpath)
- [extendEnv](test_setup.RunOptions.md#extendenv)
- [gid](test_setup.RunOptions.md#gid)
- [input](test_setup.RunOptions.md#input)
- [killSignal](test_setup.RunOptions.md#killsignal)
- [localDir](test_setup.RunOptions.md#localdir)
- [maxBuffer](test_setup.RunOptions.md#maxbuffer)
- [preferLocal](test_setup.RunOptions.md#preferlocal)
- [reject](test_setup.RunOptions.md#reject)
- [serialization](test_setup.RunOptions.md#serialization)
- [shell](test_setup.RunOptions.md#shell)
- [stderr](test_setup.RunOptions.md#stderr)
- [stdin](test_setup.RunOptions.md#stdin)
- [stdio](test_setup.RunOptions.md#stdio)
- [stdout](test_setup.RunOptions.md#stdout)
- [stripFinalNewline](test_setup.RunOptions.md#stripfinalnewline)
- [timeout](test_setup.RunOptions.md#timeout)
- [uid](test_setup.RunOptions.md#uid)
- [windowsHide](test_setup.RunOptions.md#windowshide)
- [windowsVerbatimArguments](test_setup.RunOptions.md#windowsverbatimarguments)

## Properties

### all

• `Optional` `Readonly` **all**: `boolean`

Add an `.all` property on the promise and the resolved value. The property contains the output of the process with `stdout` and `stderr` interleaved.

**`Default`**

```ts
false
```

#### Inherited from

execa.Options.all

#### Defined in

node_modules/execa/index.d.ts:96

___

### argv0

• `Optional` `Readonly` **argv0**: `string`

Explicitly set the value of `argv[0]` sent to the child process. This will be set to `command` or `file` if not specified.

#### Inherited from

execa.Options.argv0

#### Defined in

node_modules/execa/index.d.ts:129

___

### buffer

• `Optional` `Readonly` **buffer**: `boolean`

Buffer the output from the spawned process. When set to `false`, you must read the output of `stdout` and `stderr` (or `all` if the `all` option is `true`). Otherwise the returned promise will not be resolved/rejected.

If the spawned process fails, `error.stdout`, `error.stderr`, and `error.all` will contain the buffered data.

**`Default`**

```ts
true
```

#### Inherited from

execa.Options.buffer

#### Defined in

node_modules/execa/index.d.ts:61

___

### cleanup

• `Optional` `Readonly` **cleanup**: `boolean`

Kill the spawned process when the parent process exits unless either:
	- the spawned process is [`detached`](https://nodejs.org/api/child_process.html#child_process_options_detached)
	- the parent process is terminated abruptly, for example, with `SIGKILL` as opposed to `SIGTERM` or a normal exit

**`Default`**

```ts
true
```

#### Inherited from

execa.Options.cleanup

#### Defined in

node_modules/execa/index.d.ts:23

___

### cwd

• `Optional` `Readonly` **cwd**: `string`

Current working directory of the child process.

**`Default`**

```ts
process.cwd()
```

#### Inherited from

execa.Options.cwd

#### Defined in

node_modules/execa/index.d.ts:117

___

### detached

• `Optional` `Readonly` **detached**: `boolean`

Prepare child to run independently of its parent process. Specific behavior [depends on the platform](https://nodejs.org/api/child_process.html#child_process_options_detached).

**`Default`**

```ts
false
```

#### Inherited from

execa.Options.detached

#### Defined in

node_modules/execa/index.d.ts:156

___

### encoding

• `Optional` `Readonly` **encoding**: `string`

Specify the character encoding used to decode the `stdout` and `stderr` output. If set to `null`, then `stdout` and `stderr` will be a `Buffer` instead of a string.

**`Default`**

```ts
'utf8'
```

#### Inherited from

execa.Options.encoding

#### Defined in

node_modules/execa/index.d.ts:185

___

### env

• `Optional` `Readonly` **env**: `ProcessEnv`

Environment key-value pairs. Extends automatically from `process.env`. Set `extendEnv` to `false` if you don't want this.

**`Default`**

```ts
process.env
```

#### Inherited from

execa.Options.env

#### Defined in

node_modules/execa/index.d.ts:124

___

### execPath

• `Optional` `Readonly` **execPath**: `string`

Path to the Node.js executable to use in child processes.

This can be either an absolute path or a path relative to the `cwd` option.

Requires `preferLocal` to be `true`.

For example, this can be used together with [`get-node`](https://github.com/ehmicky/get-node) to run a specific Node.js version in a child process.

**`Default`**

```ts
process.execPath
```

#### Inherited from

execa.Options.execPath

#### Defined in

node_modules/execa/index.d.ts:52

___

### extendEnv

• `Optional` `Readonly` **extendEnv**: `boolean`

Set to `false` if you don't want to extend the environment variables when providing the `env` property.

**`Default`**

```ts
true
```

#### Inherited from

execa.Options.extendEnv

#### Defined in

node_modules/execa/index.d.ts:110

___

### gid

• `Optional` `Readonly` **gid**: `number`

Sets the group identity of the process.

#### Inherited from

execa.Options.gid

#### Defined in

node_modules/execa/index.d.ts:166

___

### input

• `Optional` `Readonly` **input**: `string` \| `Readable` \| `Buffer`

Write some input to the `stdin` of your binary.

#### Inherited from

execa.Options.input

#### Defined in

node_modules/execa/index.d.ts:227

___

### killSignal

• `Optional` `Readonly` **killSignal**: `string` \| `number`

Signal value to be used when the spawned process will be killed.

**`Default`**

```ts
'SIGTERM'
```

#### Inherited from

execa.Options.killSignal

#### Defined in

node_modules/execa/index.d.ts:206

___

### localDir

• `Optional` `Readonly` **localDir**: `string`

Preferred path to find locally installed binaries in (use with `preferLocal`).

**`Default`**

```ts
process.cwd()
```

#### Inherited from

execa.Options.localDir

#### Defined in

node_modules/execa/index.d.ts:39

___

### maxBuffer

• `Optional` `Readonly` **maxBuffer**: `number`

Largest amount of data in bytes allowed on `stdout` or `stderr`. Default: 100 MB.

**`Default`**

```ts
100_000_000
```

#### Inherited from

execa.Options.maxBuffer

#### Defined in

node_modules/execa/index.d.ts:199

___

### preferLocal

• `Optional` `Readonly` **preferLocal**: `boolean`

Prefer locally installed binaries when looking for a binary to execute.

If you `$ npm install foo`, you can then `execa('foo')`.

**`Default`**

```ts
false
```

#### Inherited from

execa.Options.preferLocal

#### Defined in

node_modules/execa/index.d.ts:32

___

### reject

• `Optional` **reject**: `boolean`

Setting this to `true` rejects the promise instead of resolving it with the error.

**`Default`**

```ts
false
```

#### Overrides

execa.Options.reject

#### Defined in

[test/setup.ts:728](https://github.com/nhscc/inbdpa.api.hscc.bdpa.org/blob/742232e/test/setup.ts#L728)

___

### serialization

• `Optional` `Readonly` **serialization**: ``"json"`` \| ``"advanced"``

Specify the kind of serialization used for sending messages between processes when using the `stdio: 'ipc'` option or `execa.node()`:
	- `json`: Uses `JSON.stringify()` and `JSON.parse()`.
	- `advanced`: Uses [`v8.serialize()`](https://nodejs.org/api/v8.html#v8_v8_serialize_value)

Requires Node.js `13.2.0` or later.

[More info.](https://nodejs.org/api/child_process.html#child_process_advanced_serialization)

**`Default`**

```ts
'json'
```

#### Inherited from

execa.Options.serialization

#### Defined in

node_modules/execa/index.d.ts:149

___

### shell

• `Optional` `Readonly` **shell**: `string` \| `boolean`

If `true`, runs `command` inside of a shell. Uses `/bin/sh` on UNIX and `cmd.exe` on Windows. A different shell can be specified as a string. The shell should understand the `-c` switch on UNIX or `/d /s /c` on Windows.

We recommend against using this option since it is:
- not cross-platform, encouraging shell-specific syntax.
- slower, because of the additional shell interpretation.
- unsafe, potentially allowing command injection.

**`Default`**

```ts
false
```

#### Inherited from

execa.Options.shell

#### Defined in

node_modules/execa/index.d.ts:178

___

### stderr

• `Optional` `Readonly` **stderr**: `StdioOption`

Same options as [`stdio`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio).

**`Default`**

```ts
'pipe'
```

#### Inherited from

execa.Options.stderr

#### Defined in

node_modules/execa/index.d.ts:82

___

### stdin

• `Optional` `Readonly` **stdin**: `StdioOption`

Same options as [`stdio`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio).

**`Default`**

```ts
'pipe'
```

#### Inherited from

execa.Options.stdin

#### Defined in

node_modules/execa/index.d.ts:68

___

### stdio

• `Optional` `Readonly` **stdio**: ``"pipe"`` \| ``"ignore"`` \| ``"inherit"`` \| readonly `StdioOption`[]

Child's [stdio](https://nodejs.org/api/child_process.html#child_process_options_stdio) configuration.

**`Default`**

```ts
'pipe'
```

#### Inherited from

execa.Options.stdio

#### Defined in

node_modules/execa/index.d.ts:136

___

### stdout

• `Optional` `Readonly` **stdout**: `StdioOption`

Same options as [`stdio`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio).

**`Default`**

```ts
'pipe'
```

#### Inherited from

execa.Options.stdout

#### Defined in

node_modules/execa/index.d.ts:75

___

### stripFinalNewline

• `Optional` `Readonly` **stripFinalNewline**: `boolean`

Strip the final [newline character](https://en.wikipedia.org/wiki/Newline) from the output.

**`Default`**

```ts
true
```

#### Inherited from

execa.Options.stripFinalNewline

#### Defined in

node_modules/execa/index.d.ts:103

___

### timeout

• `Optional` `Readonly` **timeout**: `number`

If `timeout` is greater than `0`, the parent will send the signal identified by the `killSignal` property (the default is `SIGTERM`) if the child runs longer than `timeout` milliseconds.

**`Default`**

```ts
0
```

#### Inherited from

execa.Options.timeout

#### Defined in

node_modules/execa/index.d.ts:192

___

### uid

• `Optional` `Readonly` **uid**: `number`

Sets the user identity of the process.

#### Inherited from

execa.Options.uid

#### Defined in

node_modules/execa/index.d.ts:161

___

### windowsHide

• `Optional` `Readonly` **windowsHide**: `boolean`

On Windows, do not create a new console window. Please note this also prevents `CTRL-C` [from working](https://github.com/nodejs/node/issues/29837) on Windows.

**`Default`**

```ts
true
```

#### Inherited from

execa.Options.windowsHide

#### Defined in

node_modules/execa/index.d.ts:220

___

### windowsVerbatimArguments

• `Optional` `Readonly` **windowsVerbatimArguments**: `boolean`

If `true`, no quoting or escaping of arguments is done on Windows. Ignored on other platforms. This is set to `true` automatically when the `shell` option is `true`.

**`Default`**

```ts
false
```

#### Inherited from

execa.Options.windowsVerbatimArguments

#### Defined in

node_modules/execa/index.d.ts:213
