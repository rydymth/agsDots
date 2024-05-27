const entry = App.configDir + '/tsAgs/main.ts'
const outdir = '/home/rudy/.cache/AgsJs'
import App from 'resource:///com/github/Aylur/ags/app.js'

try {
    await Utils.execAsync([
        'bun', 'build', entry,
        '--outdir', outdir,
        '--external', 'resource://*',
        '--external', 'gi://*',
        '--external", "file://*',
    ])
    await import(`file://${outdir}/main.js`)
} catch (error) {
    console.error(error)
}
const main = await import(`file://${outdir}/main.js`)
App.config(main)
