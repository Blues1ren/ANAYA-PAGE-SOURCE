var i18nTranslator = null;

function __(text) {
    var lang = $('html').attr('lang');
    if (i18nTranslator == null) {
        i18nTranslator = new i18n(lang);
    }
    
    var args = Array.from(arguments);
    args.shift();
    return i18nTranslator.translate(text, args);
}

class i18n {
    constructor(lang) {
        this.lang = lang;
        this.translations = null;
        this.getTranslations();
    }
    getTranslations() {
        if (this.translations == null) {
            var that = this;
            $.ajax({
                url: '/i18n/' + this.lang + '/js',
                success: function (result) {
                    that.translations = result;
                },
                async: false,
                cache: true
            });
        }
        return this.translations;
    }

    translate(text, args) {
        if (typeof this.translations[text] === 'undefined') {
            //console.error('Missing translation: ' + text);
            return "¡¡¡" + text + "!!!";
        }
        return vsprintf(this.translations[text], args);
    }
}