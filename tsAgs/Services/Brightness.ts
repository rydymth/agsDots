import Service from 'resource:///com/github/Aylur/ags/service.js';
import { execAsync, exec } from 'resource:///com/github/Aylur/ags/utils.js';

class Brightness extends Service {
    static {
        Service.register(this, {}, {
            'screen': ['float', 'rw'],
        });
    }

    _screen = Number(exec('light -G'));

    get screen() { return this._screen; }

    set screen(percent) {
        if (percent < 0)
            percent = 0;

        if (percent > 1)
            percent = 1;

        execAsync(`light -S ${percent}`)
            .then(() => {
                this._screen = percent;
                this.changed('screen');
            })
            .catch(print);
    }

    constructor() {
        super();
         Utils.monitorFile("/sys/class/backlight/intel_backlight/brightness", async f => {
            const v = await Utils.readFileAsync(f)
            this._screen = Number(exec('light -G'));
            this.changed("screen")
        })
    }
}

export default new Brightness();