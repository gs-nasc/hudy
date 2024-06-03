Math.clamp = function(number, min, max) {
    return Math.max(min, Math.min(number,max));
}

const Page = {
    init: () => {
        Page.theme.setup();
        Page.load.init();
        document.addEventListener("DOMContentLoaded", Page.events.bodyLoaded);
        Page.languages.load();
    },
    setupLogos: () => { 
        document.querySelectorAll("logo").forEach(l => {
            const svg = `
            <?xml version="1.0" encoding="utf-8"?>
            <svg viewBox="15.67 30.7829 83.54 60.7571" xmlns="http://www.w3.org/2000/svg">
            <path stroke-width="0" fill="currentColor" class="c" d="M40.46,70.39c-7.64.2-15.45,2.7-24.79,1.38,7.13-7.1,15.52-10.71,22.97-15.71-1.85-6.25-6.6-9.91-9.78-14.86,6.99,1.36,11.86,5.94,16.4,11.63,7.1-2.63,14.01-5.19,21.39-7.92-2.14-5.99-6.6-9.63-10.13-14.12,5.19-.1,6.39.72,17.76,11.94,7.8-.42,15.61-3.44,24.93-2.68-6.07,7.12-13.63,10.72-20.26,15.86-.57,6.51-.09,13.44-4.85,19.95-1.11-5.61.06-10.69-1.64-15.19-2-1.24-3.42,0-4.9.58-3.88,1.49-7.7,3.16-11.62,4.55-7.64,2.71-9.89,7.24-7.32,15.04.57,1.72,1.39,3.47,1.46,5.23.13,2.98-1.34,5.46-4.53,5.47-3.2,0-4.48-2.46-4.63-5.45-.1-1.9.89-3.51,1.49-5.23,1.45-4.15.98-6.76-1.94-10.45Z" transform="matrix(0.9999999999999999, 0, 0, 0.9999999999999999, -3.552713678800501e-15, 0)"/>
            </svg>`;

            l.innerHTML = svg + l.innerHTML;
        });
    },
    load: {
        loaded: 0,
        totalToLoad: 0,
        loading: () => {
            Page.load.loaded++;
            const percentage = 100/Page.load.totalToLoad*Page.load.loaded;
            const progress = document.querySelector(".loading .bar");
            const progressCounter = progress.querySelector("span");
            gsap.to(progress, {
                width: `${percentage}%`,
            });
            progressCounter.innerText = `${Math.floor(percentage)}%`;
            if(Page.load.loaded == Page.load.totalToLoad) Page.load.done();
        },
        done: () => {
            setTimeout(() => {
                document.body.classList.remove("loading");
            }, 1000);
        },
        init: () => {
            const images = document.images;
            Page.load.totalToLoad = images.length + 1;
            setTimeout(() => {
                [...images].forEach(img => {
                    const tmpImg = new Image();
                    tmpImg.onload = Page.load.loading;
                    tmpImg.onerror = Page.load.loading;
                    tmpImg.src = img.src;
                });
            }, 1000);
        }
    },
    languages: {
        en: undefined,
        kr: undefined,
        originalHtml: undefined,
        load: () => {
                const requestOptions = {
                    method: "GET",
                    redirect: "follow"
                  };
                  
                fetch("./assets/languages/en.json", requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    Page.languages.en = result;
                    fetch("http://127.0.0.1:5500/assets/languages/kr.json", requestOptions)
                    .then((response) => response.json())
                    .then((result) => {
                        Page.languages.kr = result;
    
                        language = localStorage.getItem("language");
                        if(language == undefined || language == null) {
                            language = "en";
                        }
    
                        Page.languages.select(language);
                    })
                    .catch((error) => console.error(error));
                })
                .catch((error) => console.error(error));
        },
        /**
         * 
         * @param {"kr" | "en"} language 
         */
        select: (language) => {
            localStorage.setItem("language", language);
            const lan = (language == "en") ? Page.languages.en : Page.languages.kr;
            
            const langDivs = document.querySelectorAll("[data-language]");
           
            langDivs.forEach(elm => {
                let placeholder = elm.getAttribute("data-language");
                let text = "";    
                if(placeholder.includes(".")) {
                    placeholder = placeholder.split(".");
                    text = lan;
                    placeholder.map(s => {
                        text = text[s];
                    })
                }else {
                    text = lan[placeholder];
                }

                elm.innerText = text;
            })

            const inputs = document.querySelectorAll("input[name='language']");

            inputs.forEach(i => {
                const val = i.value;
                if(val == language) {
                    i.setAttribute("checked", true);
                }else {
                    i.removeAttribute("checked");
                }
            });
            
            const languageControl = document.querySelectorAll(".lang-c");
            languageControl.forEach(elm => {
                const selectedLanguage = elm.getAttribute("data-lang");
                if(selectedLanguage == language) {
                    elm.classList.remove("hidden");
                }else {
                    elm.classList.add("hidden");
                }
            });

            Page.load.loading();

            Page.events.register();

        },
        /**
         * 
         * @param {Event} ev 
         */
        input: (ev) => {
            const target = ev.target;
            
            if(ev.target.getAttribute("name") == "language") Page.languages.select(target.value);
        }
    },
    page: {
        click: (ev) => {
            let target = ev.target;
            if(target.getAttribute("data-page") == null) {
                do {
                    target = target.parentElement;
                    console.log(target)
                } while (target.getAttribute("data-page") == null);
            }
            const page = target.getAttribute("data-page");
            Page.page.change(page);
        },
        change: (page) => {
            const requestOptions = {
                method: "GET",
                redirect: "follow"
              };
              
            fetch(page, requestOptions)
            .then((response) => response.text())
            .then(Page.page.process)
            .catch(console.error);

            window.history.pushState(null, null, `${page}`)
        },
        process: (rawContent) => {
            const page = new DOMParser().parseFromString(rawContent, "text/html");
            const content = page.querySelector(".page-content").innerHTML;
            Page.page.content(content);
        },
        content: (content) => {
            const pageContent = document.querySelector(".page-content");
            pageContent.innerHTML = content;
            Page.events.bodyLoaded();
            Page.events.register();
            Page.languages.load();
            Page.theme.setup();
            window.scrollTo(0, 0);
            Page.cursor.reset();
        }
    },
    events: {
        prevSroll: 0,
        register: () => {
            window.addEventListener("scroll", Page.events.scroll);
            document.addEventListener("mousemove", Page.cursor.move);
            document.querySelectorAll(".hoverable").forEach(elm => Page.cursor.hoverables(elm));
            document.querySelectorAll("input[type='radio']").forEach(elm => elm.addEventListener("change", Page.theme.input));
            document.querySelectorAll("input[type='radio']").forEach(elm => elm.addEventListener("change", Page.languages.input));
            document.querySelectorAll("[data-page]").forEach(elm => elm.addEventListener("click", Page.page.click));
        },
        bodyLoaded: () => {
            Page.setupLogos();
        },
        scroll: (ev) => {
            // LANGUAGE MOVEMENT
            const scrollY = window.scrollY;
            const pageHeight = document.body.clientHeight - window.innerHeight;

            const normalized = 100 * Math.clamp(scrollY, 0, pageHeight) / pageHeight;

            const elm = document.querySelector(".settings.br");
            gsap.to(elm, {
                bottom: `calc(${normalized}px + 3rem)`
            });

            // PRODUCT INFO MOVEMENT
            const productPage = document.querySelector(".product-page");
            if(productPage) {
                const productInfo = document.querySelector(".product-info");
                const pageHeight = productPage.clientHeight;
                const infoHeight = productInfo.clientHeight;
                const limit = pageHeight - (infoHeight*2);
                const translate = Math.floor(limit * (normalized/100));
                
                gsap.to(productInfo, {
                    transform: `translateY(calc(${translate}px))`,
                    duration: 0
                });
            }

            // CURSOR
            const currentScroll = window.scrollY;
            const deltaY = currentScroll - Page.events.prevSroll;

            Page.cursor.y = Page.cursor.y + deltaY;

            Page.events.prevSroll = currentScroll;
        
            Page.cursor.update();
        }
    },
    theme: {
        setup: () => {
            let theme = localStorage.getItem("theme");
            if(theme == undefined || theme == null) {
                localStorage.setItem("theme", "green");
                theme = "green";
            }else {
                Page.theme.change(theme);
            }

            const inp = document.querySelector(`input[name='theme'][value='${theme}']`);
            inp.setAttribute("checked", "true");
        },
        /**
         * 
         * @param {String} theme 
         */
        change: (theme) => {
            localStorage.setItem("theme", theme);
            const body = document.querySelector("body");
            body.classList.forEach(cl => {
                if(cl != "loading") body.classList.remove(cl);
            });
            body.classList.add(theme);
        },
        /**
         * 
         * @param {Event} ev 
         */
        input: (ev) => {
            const target = ev.target;
            
            if(ev.target.getAttribute("name") == "theme") Page.theme.change(target.value);
        }
    },
    cursor: {
        x: 0,
        y: 0,
        cursorElm: document.querySelector(".cursor"),
        cursorSmallElm: document.querySelector(".cursor .cursor-small"),
        cursorBigElm: document.querySelector(".cursor .cursor-big"),
        /**
         * 
         * @param {Element} elm 
         */
        hoverables: (elm) => {
            elm.addEventListener("mouseenter", Page.cursor.hover);
            elm.addEventListener("mouseleave", Page.cursor.hover);
        },
        reset: () => {
            const cursorBig = Page.cursor.cursorBigElm;
            const scale =  30;
            const margin = -15;
            gsap.to(cursorBig, {width: `${scale}px`, height: `${scale}px`, top: `${margin}px`, left: `${margin}px`, duration: .2});

            const cursorSmall = Page.cursor.cursorSmallElm;

            const cursorArrow = cursorSmall.querySelector("svg.arrow");
            const cursorCross = cursorSmall.querySelector("svg.cross");

            const arrowOpacity = 0;
            const textOpacity = 0;
            const crossOpacity = 1;

            const arrowRotation = 135;
            const textRotation = 45;
            const crossRotation = 45;

            const text = document.querySelector(".cursor .text");

            gsap.to(cursorCross, {
                opacity: crossOpacity,
                transform: `rotate(${crossRotation}deg)`,
                duration: .2
            });
            gsap.to(cursorArrow, {
                opacity: arrowOpacity,
                transform: `rotate(${arrowRotation}deg)`,
                duration: .2
            });
            gsap.to(text, {
                opacity: textOpacity,
                transform: `rotate(${textRotation}deg)`,
                duration: .2
            })
        },
        /**
         * 
         * @param {MouseEvent} ev 
         */
        move: (ev) => {
            Page.cursor.x = ev.pageX;
            Page.cursor.y = ev.pageY;

            Page.cursor.update();
        },
        update: () => {
            const cursorSmall = Page.cursor.cursorSmallElm;
            const cursorBig = Page.cursor.cursorBigElm;

            gsap.to(cursorSmall, {x: Page.cursor.x, y: Page.cursor.y, duration: .1});
            gsap.to(cursorBig, {
                x: Page.cursor.x,
                y: Page.cursor.y,
                duration: .5
            }).timeScale(2);
        },
        /**
         * 
         * @param {MouseEvent} ev 
         */
        hover: (ev) => {
            const cursorBig = Page.cursor.cursorBigElm;
            const scale = (ev.type == "mouseenter") ? "60px" : "30px";
            const margin = (ev.type == "mouseenter") ? "-30px" : "-15px";
            gsap.to(cursorBig, {width: scale, height: scale, top: margin, left: margin, duration: .2});

            const cursorSmall = Page.cursor.cursorSmallElm;

            const cursorArrow = cursorSmall.querySelector("svg.arrow");
            const cursorCross = cursorSmall.querySelector("svg.cross");

            const arrowOpacity = (ev.type == "mouseenter") ? 1 : 0;
            const textOpacity = (ev.type == "mouseenter") ? 1 : 0;
            const crossOpacity = (ev.type == "mouseenter") ? 0 : 1;

            const arrowRotation = (ev.type == "mouseenter" ? 0 : 135);
            const textRotation = (ev.type == "mouseenter" ? 0 : 45);
            const crossRotation = (ev.type == "mouseenter" ? 135 : 45);

            const text = document.querySelector(".cursor .text");

            gsap.to(cursorCross, {
                opacity: crossOpacity,
                transform: `rotate(${crossRotation}deg)`,
                duration: .2
            });

            const target = ev.target;
            const hoverText = target.getAttribute("data-hover-text");
            if(hoverText == undefined) {
                gsap.to(cursorArrow, {
                    opacity: arrowOpacity,
                    transform: `rotate(${arrowRotation}deg)`,
                    duration: .2
                });
            }else {
                text.innerHTML = hoverText;
                gsap.to(text, {
                    opacity: textOpacity,
                    transform: `rotate(${textRotation}deg)`,
                    duration: .2
                })
            }
        }
    },
};

Page.init();