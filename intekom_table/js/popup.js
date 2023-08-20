/* Модальное окно */

class PopUp {
    objid = {}

    constructor(config) {
        console.log("PopUp::constructor(): config:", config);

        this.objid = document.getElementById(config.id);
        console.log("PopUp::constructor(): obj;", this.objid);
    }

    open() {
        console.log("PopUp::open()")

        this.objid.classList.add("open");
    }

    close() {
        console.log("PopUp::close()");
        this.objid.classList.remove("open");
    }

    submit() {
        console.log("PopUp::submit()")
    }

    error(msg) {
        console.log("PopUp::error()")
    }
}
