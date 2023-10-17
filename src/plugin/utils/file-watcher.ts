import Watcher from 'watcher'

type Callback = (type: 'renameDir' | 'unlinkDir' | 'unlink', ...args: string[]) => void

export function initWatcher(target: string[], cb: Callback) {
  try {
    const watcher = new Watcher(target, {
      debounce: 0,
      ignoreInitial: true,
      recursive: true,
      renameDetection: true,
      renameTimeout: 0,
    })

    const onChange: Callback = (type, ...args) => {
      cb(type, ...args)
    }

    watcher.on('renameDir', (...args) => onChange('renameDir', ...args))
    watcher.on('unlinkDir', (...args) => onChange('unlinkDir', ...args))
    watcher.on('unlink', (...args) => onChange('unlink', ...args))
  } catch (error) {
    console.error(error)
  }
}
