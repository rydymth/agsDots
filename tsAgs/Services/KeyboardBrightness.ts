import Service from 'resource:///com/github/Aylur/ags/service.js';
import { execAsync, exec } from 'resource:///com/github/Aylur/ags/utils.js';

class kbdBrightness extends Service {
    static {
        Service.register(this, {}, {
            'screen': ['float', 'rw'],
        });
    }

    _screen = Number(exec('light -s sysfs/leds/:white:kbd_backlight -G'));

    get screen() { return this._screen; }

    set screen(percent) {
        if (percent < 0)
            percent = 0;

        if (percent > 1)
            percent = 1;

        execAsync(`light -s sysfs/leds/:white:kbd_backlight -S ${percent}`)
            .then(() => {
                this._screen = percent;
                this.changed('screen');
            })
            .catch(print);
    }

    constructor() {
        super();
         Utils.monitorFile("/home/rudy/.cache/bklight.tmp", async f => {
            const v = await Utils.readFileAsync(f).catch(() => console.log("Its ok"))
            this._screen = Number(exec('light -s sysfs/leds/:white:kbd_backlight -G'));
            this.changed("screen")
        })
    }
}

export default new kbdBrightness();