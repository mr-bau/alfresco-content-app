(window.webpackJsonp=window.webpackJsonp||[]).push([[47],{1477:function(e,t,n){"use strict";n(45),n(51),n(92),n(34),n(75),n(116),n(40),n(16),n(19),n(12),n(14),n(8),n(13),n(9),n(10),n(11),n(15),n(20),n(17);var o=n(0),i=n.n(o),r=n(18),l=n.n(r),a=(n(1499),n(409)),c=n(4),d=n.n(c),s=n(2),u=n(6),p=n(47),m=n(21),h=n(3),f=n(49);function y(e){return function(e){if(Array.isArray(e))return w(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||x(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function b(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var o,i,r,l,a=[],c=!0,d=!1;try{if(r=(n=n.call(e)).next,0===t){if(Object(n)!==n)return;c=!1}else for(;!(c=(o=r.call(n)).done)&&(a.push(o.value),a.length!==t);c=!0);}catch(e){d=!0,i=e}finally{try{if(!c&&null!=n.return&&(l=n.return(),Object(l)!==l))return}finally{if(d)throw i}}return a}}(e,t)||x(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function x(e,t){if(e){if("string"==typeof e)return w(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?w(e,t):void 0}}function w(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,o=new Array(t);n<t;n++)o[n]=e[n];return o}var g=function(e){var t,n;if(!e)return e;var o=e;return null!==(t=o)&&void 0!==t&&t.toHexString&&(o=o.toHexString()),null!==(n=o)&&void 0!==n&&n.toLowerCase&&(o=o.toLowerCase()),o},v=i.a.createElement("svg",{width:"100%",height:"100%",className:l()("transparent")},i.a.createElement("line",{stroke:"#d82e28",x1:"0",y1:"100%",x2:"100%",y2:"0",strokeWidth:"2",strokeLinecap:"round"})),S={color:d.a.any},C=function(e){var t=e.onColorChange,n=e.hasTransparentColor,r=void 0!==n&&n,c=e.color,d=e.activeTool,x=e.type,w=Object.values(window.Core.Tools.ToolNames).includes(d)?d:window.Core.Tools.ToolNames.EDIT,S=Object(u.f)(),C=Object(a.a)().t,k=Object(u.d)(),E=b(Object(u.e)((function(e){return[h.a.getColors(e,w,x)]})),1)[0],T=b(Object(o.useState)(),2),P=T[0],A=T[1],O=b(Object(o.useState)(!1),2),j=O[0],R=O[1],z=Object(o.useRef)(!0);Object(o.useEffect)((function(){z.current=!0}),[w,c]),Object(o.useEffect)((function(){c&&A(g(c))}),[c]);var N=function(){var e=h.a.getCustomColor(S.getState());return k(s.a.setCustomColor(null)),e},F=Object(o.useCallback)((function(){k(s.a.openElement("ColorPickerModal"));Object(m.c)().addEventListener(p.a.VISIBILITY_CHANGED,(function e(n){var o=n.detail,i=o.element,r=o.isVisible;if("ColorPickerModal"===i&&!r){var l=g(N());if(l)if(E.includes(l))A(l),t(l);else{var a=[].concat(y(E),[l]);k(s.a.setColors(a,w,x,!0)),A(l),t(l)}}Object(m.c)().removeEventListener(p.a.VISIBILITY_CHANGED,e)}))}),[null==E?void 0:E.length,k,A,t,N,x,w]),I=E.map((function(e){return e.toLowerCase()}));r&&I.push("transparent"),P||A("transparent"),I.indexOf(P)>6&&!j&&z.current&&(R(!0),z.current=!1);var L=I.length<=7,_=!(P&&!I.includes(P)),D=I.length<=1||!_;return j||(I=I.slice(0,7)),i.a.createElement(i.a.Fragment,null,i.a.createElement("div",{className:l()("ColorPalette")},I.map((function(e){return g(e)})).map((function(e,n){return e?i.a.createElement("button",{key:n,className:"cell-container",onClick:function(){A(e),t(e)},"aria-label":"".concat(C("option.colorPalette.colorLabel")," ").concat(n+1)},i.a.createElement("div",{className:l()({"cell-outer":!0,active:g(P)===e||!g(P)&&"transparent"===e})},i.a.createElement("div",{className:l()({cell:!0,border:"#ffffff"===e||"transparent"===e}),style:{backgroundColor:e}},"transparent"===e&&v))):i.a.createElement("div",{key:n,className:"dummy-cell"})}))),i.a.createElement("div",{className:"palette-controls"},i.a.createElement("div",{className:"button-container"},i.a.createElement(f.a,{img:"icon-header-zoom-in-line",title:C("action.addNewColor"),onClick:F,className:"control-button",dataElement:"addCustomColor"}),i.a.createElement(f.a,{img:"icon-delete-line",title:C("action.deleteColor"),onClick:function(){var e=g(P),n=y(E),o=n.indexOf(e);if(o>-1){var i=o===n.length-1?0:o+1;A(E[i]),t(E[i]),n.splice(o,1),k(s.a.setColors(n,w,x,!0))}},disabled:D,className:"control-button",dataElement:"deleteSelectedColor"}),i.a.createElement(f.a,{img:"icon-copy2",title:C("action.copySelectedColor"),onClick:function(){var e=g(P),t=[].concat(y(E),[e]);k(s.a.setColors(t,w,x,!0))},disabled:_,className:"control-button",dataElement:"copySelectedColor"})),i.a.createElement("button",{className:l()("show-more-button control-button",{hidden:L}),onClick:function(){R(!j)}},C(j?"message.showLess":"message.showMore"))))};C.propTypes=S;var k=C;t.a=k},1499:function(e,t,n){var o=n(30),i=n(1500);"string"==typeof(i=i.__esModule?i.default:i)&&(i=[[e.i,i,""]]);var r={insert:function(e){if(!window.isApryseWebViewerWebComponent)return void document.head.appendChild(e);let t;t=document.getElementsByTagName("apryse-webviewer"),t.length||(t=function e(t,n=document){const o=[];return n.querySelectorAll(t).forEach(e=>o.push(e)),n.querySelectorAll("*").forEach(n=>{n.shadowRoot&&o.push(...e(t,n.shadowRoot))}),o}("apryse-webviewer"));const n=[];for(let o=0;o<t.length;o++){const i=t[o];if(0===o)i.shadowRoot.appendChild(e),e.onload=function(){n.length>0&&n.forEach(t=>{t.innerHTML=e.innerHTML})};else{const t=e.cloneNode(!0);i.shadowRoot.appendChild(t),n.push(t)}}},singleton:!1};o(i,r);e.exports=i.locals||{}},1500:function(e,t,n){(t=e.exports=n(31)(!1)).push([e.i,":host{display:inline-block;container-type:inline-size;width:100%;height:100%;overflow:hidden}@media(min-width:901px){.App:not(.is-web-component) .hide-in-desktop{display:none}}@container (min-width: 901px){.hide-in-desktop{display:none}}@media(min-width:641px)and (max-width:900px){.App:not(.is-in-desktop-only-mode):not(.is-web-component) .hide-in-tablet{display:none}}@container (min-width: 641px) and (max-width: 900px){.App.is-web-component:not(.is-in-desktop-only-mode) .hide-in-tablet{display:none}}@media(max-width:640px)and (min-width:431px){.App:not(.is-web-component) .hide-in-mobile{display:none}}@container (max-width: 640px) and (min-width: 431px){.App.is-web-component .hide-in-mobile{display:none}}@media(max-width:430px){.App:not(.is-web-component) .hide-in-small-mobile{display:none}}@container (max-width: 430px){.App.is-web-component .hide-in-small-mobile{display:none}}.always-hide{display:none}.StylePicker .ColorPalette{display:flex;flex-wrap:wrap;display:grid;grid-template-columns:repeat(7,1fr);grid-row-gap:8px;row-gap:8px;justify-items:center}@media (-ms-high-contrast:active),(-ms-high-contrast:none){.StylePicker .ColorPalette{width:196px}}.StylePicker .ColorPalette.padding{padding:4px 12px 8px}@media(max-width:640px){.App:not(.is-in-desktop-only-mode):not(.is-web-component) .StylePicker .ColorPalette{max-width:450px;width:auto}}@media(max-width:640px)and (-ms-high-contrast:active),(max-width:640px)and (-ms-high-contrast:none){.App:not(.is-in-desktop-only-mode):not(.is-web-component) .StylePicker .ColorPalette{width:308px}}@container (max-width: 640px){.App.is-web-component:not(.is-in-desktop-only-mode) .StylePicker .ColorPalette{max-width:450px;width:auto}@media (-ms-high-contrast:active),(-ms-high-contrast:none){.App.is-web-component:not(.is-in-desktop-only-mode) .StylePicker .ColorPalette{width:308px}}}.StylePicker .ColorPalette .cell-container{padding:0;border:none;background-color:transparent;flex:1 0 14%;cursor:pointer;width:28px;height:28px;display:flex;align-items:center;justify-content:center}:host(:not([data-tabbing=true])) .StylePicker .ColorPalette .cell-container,html:not([data-tabbing=true]) .StylePicker .ColorPalette .cell-container{outline:none}@media(max-width:640px){.App:not(.is-in-desktop-only-mode):not(.is-web-component) .StylePicker .ColorPalette .cell-container{width:44px;height:44px}}@container (max-width: 640px){.App.is-web-component:not(.is-in-desktop-only-mode) .StylePicker .ColorPalette .cell-container{width:44px;height:44px}}.StylePicker .ColorPalette .cell-container .cell-outer.active{border:1px solid var(--color-palette-border);width:26px;height:26px;border-radius:10000000px;display:flex;align-items:center;justify-content:center}@media(max-width:640px){.App:not(.is-in-desktop-only-mode):not(.is-web-component) .StylePicker .ColorPalette .cell-container .cell-outer.active{width:36px;height:36px}}@container (max-width: 640px){.App.is-web-component:not(.is-in-desktop-only-mode) .StylePicker .ColorPalette .cell-container .cell-outer.active{width:36px;height:36px}}.StylePicker .ColorPalette .cell-container .cell-outer .cell{width:18px;height:18px;border-radius:10000000px}.StylePicker .ColorPalette .cell-container .cell-outer .cell .transparent{border:2px solid var(--faded-text);border-radius:10000000px}.StylePicker .ColorPalette .cell-container .cell-outer .cell.border{border:1px solid var(--white-color-palette-border)}@media(max-width:640px){.App:not(.is-in-desktop-only-mode):not(.is-web-component) .StylePicker .ColorPalette .cell-container .cell-outer .cell{width:24px;height:24px}}@container (max-width: 640px){.App.is-web-component:not(.is-in-desktop-only-mode) .StylePicker .ColorPalette .cell-container .cell-outer .cell{width:24px;height:24px}}.StylePicker .palette-controls{padding-right:12px;padding-left:2px;display:flex;justify-content:space-between}.StylePicker .palette-controls .button-container{display:flex;grid-gap:8px;gap:8px}.StylePicker .palette-controls .control-button{display:flex;align-items:center;justify-content:center;text-align:center;min-width:32px;min-height:32px;padding:0;border:none;background-color:transparent;cursor:pointer;border-radius:4px}:host(:not([data-tabbing=true])) .StylePicker .palette-controls .control-button,html:not([data-tabbing=true]) .StylePicker .palette-controls .control-button{outline:none}.StylePicker .palette-controls .control-button.show-more-button{color:var(--ribbon-active-color)}.StylePicker .palette-controls .control-button.show-more-button:hover{background:none;color:var(--primary-button-hover)}@media(max-width:640px){.App:not(.is-in-desktop-only-mode):not(.is-web-component) .StylePicker .palette-controls .control-button.show-more-button{color:var(--ribbon-active-color)}}@container (max-width: 640px){.App.is-web-component:not(.is-in-desktop-only-mode) .StylePicker .palette-controls .control-button.show-more-button{color:var(--ribbon-active-color)}}.StylePicker .palette-controls .control-button:disabled{cursor:default}.StylePicker .palette-controls .control-button:disabled .Icon{color:var(--disabled-icon)}.StylePicker .palette-controls .control-button.hidden{display:none}.StylePicker .palette-controls .control-button:hover{background:var(--view-header-button-hover)}",""]),t.locals={LEFT_HEADER_WIDTH:"41px",RIGHT_HEADER_WIDTH:"41px"}},1501:function(e,t,n){var o=n(30),i=n(1502);"string"==typeof(i=i.__esModule?i.default:i)&&(i=[[e.i,i,""]]);var r={insert:function(e){if(!window.isApryseWebViewerWebComponent)return void document.head.appendChild(e);let t;t=document.getElementsByTagName("apryse-webviewer"),t.length||(t=function e(t,n=document){const o=[];return n.querySelectorAll(t).forEach(e=>o.push(e)),n.querySelectorAll("*").forEach(n=>{n.shadowRoot&&o.push(...e(t,n.shadowRoot))}),o}("apryse-webviewer"));const n=[];for(let o=0;o<t.length;o++){const i=t[o];if(0===o)i.shadowRoot.appendChild(e),e.onload=function(){n.length>0&&n.forEach(t=>{t.innerHTML=e.innerHTML})};else{const t=e.cloneNode(!0);i.shadowRoot.appendChild(t),n.push(t)}}},singleton:!1};o(i,r);e.exports=i.locals||{}},1502:function(e,t,n){(t=e.exports=n(31)(!1)).push([e.i,":host{display:inline-block;container-type:inline-size;width:100%;height:100%;overflow:hidden}@media(min-width:901px){.App:not(.is-web-component) .hide-in-desktop{display:none}}@container (min-width: 901px){.hide-in-desktop{display:none}}@media(min-width:641px)and (max-width:900px){.App:not(.is-in-desktop-only-mode):not(.is-web-component) .hide-in-tablet{display:none}}@container (min-width: 641px) and (max-width: 900px){.App.is-web-component:not(.is-in-desktop-only-mode) .hide-in-tablet{display:none}}@media(max-width:640px)and (min-width:431px){.App:not(.is-web-component) .hide-in-mobile{display:none}}@container (max-width: 640px) and (min-width: 431px){.App.is-web-component .hide-in-mobile{display:none}}@media(max-width:430px){.App:not(.is-web-component) .hide-in-small-mobile{display:none}}@container (max-width: 430px){.App.is-web-component .hide-in-small-mobile{display:none}}.always-hide{display:none}@keyframes bottom-up{0%{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes up-bottom{0%{transform:translateY(0)}to{transform:translateY(100%)}}.RichTextStyleEditor{margin-bottom:16px}.RichTextStyleEditor .menu-items{margin-bottom:8px!important}.RichTextStyleEditor .menu-items .icon-grid{padding-top:12px;grid-row-gap:12px;row-gap:12px}.RichTextStyleEditor .menu-items .icon-grid .row{padding-top:0}.RichTextStyleEditor .menu-items .icon-grid .row.isRedaction{padding-bottom:8px}.RichTextStyleEditor .menu-items .icon-grid .auto-size-checkbox{padding-top:4px;padding-bottom:8px}.RichTextStyleEditor .Dropdown__wrapper{width:100%}.RichTextStyleEditor .Dropdown__wrapper .Dropdown{width:100%!important}.RichTextStyleEditor .Dropdown__wrapper .Dropdown__items{right:unset}.RichTextStyleEditor .FontSizeDropdown{width:100%!important}.RichTextStyleEditor .ColorPalette{padding-bottom:8px}.RichTextStyleEditor .text-size-slider{margin-top:16px}@media(max-width:640px){.App:not(.is-in-desktop-only-mode):not(.is-web-component) .RichTextStyleEditor .icon-grid{display:flex;flex-direction:column}}@container (max-width: 640px){.App.is-web-component:not(.is-in-desktop-only-mode) .RichTextStyleEditor .icon-grid{display:flex;flex-direction:column}}",""]),t.locals={LEFT_HEADER_WIDTH:"41px",RIGHT_HEADER_WIDTH:"41px"}},1563:function(e,t,n){"use strict";n.r(t);n(34),n(45),n(51),n(19),n(82),n(321),n(417),n(418),n(12),n(14),n(8),n(13),n(9),n(10),n(11),n(16),n(15),n(20),n(17),n(26),n(27),n(25),n(22),n(33),n(32),n(55),n(23),n(24),n(57),n(56);var o=n(0),i=n.n(o),r=n(6),l=n(4),a=n.n(l),c=n(1477),d=n(1),s=n(2),u=n(3),p=(n(1501),n(5)),m=n(277),h=n(1399);function f(e){return(f="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function y(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function b(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?y(Object(n),!0).forEach((function(t){x(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):y(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function x(e,t,n){return(t=function(e){var t=function(e,t){if("object"!==f(e)||null===e)return e;var n=e[Symbol.toPrimitive];if(void 0!==n){var o=n.call(e,t||"default");if("object"!==f(o))return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"===f(t)?t:String(t)}(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function w(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var o,i,r,l,a=[],c=!0,d=!1;try{if(r=(n=n.call(e)).next,0===t){if(Object(n)!==n)return;c=!1}else for(;!(c=(o=r.call(n)).done)&&(a.push(o.value),a.length!==t);c=!0);}catch(e){d=!0,i=e}finally{try{if(!c&&null!=n.return&&(l=n.return(),Object(l)!==l))return}finally{if(d)throw i}}return a}}(e,t)||function(e,t){if(!e)return;if("string"==typeof e)return g(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return g(e,t)}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function g(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,o=new Array(t);n<t;n++)o[n]=e[n];return o}var v={annotation:a.a.object,editor:a.a.object,style:a.a.shape({TextColor:a.a.object,RichTextStyle:a.a.any}),isFreeTextAutoSize:a.a.bool,onFreeTextSizeToggle:a.a.func,onPropertyChange:a.a.func,onRichTextStyleChange:a.a.func,isRedaction:a.a.bool,isRichTextEditMode:a.a.bool,setIsRichTextEditMode:a.a.func,isTextStylePickerHidden:a.a.bool},S=function(e){var t,n,l,a,f,y,g,v,S,C,k,E,T,P=e.annotation,A=e.editor,O=e.style,j=e.isFreeTextAutoSize,R=e.onFreeTextSizeToggle,z=e.onPropertyChange,N=e.onRichTextStyleChange,F=e.isRichTextEditMode,I=e.setIsRichTextEditMode,L=e.isRedaction,_=e.isTextStylePickerHidden,D=e.activeTool,H=e.textSizeSliderComponent,M=w(Object(r.e)((function(e){return[u.a.getFonts(e)]}),r.c),1)[0],B=w(Object(o.useState)({}),2),W=B[0],Y=B[1],V=Object(o.useRef)(null),q=Object(o.useRef)(null),G=Object(o.useRef)({}),U=Object(r.d)(),J=Object(o.useRef)(),$=Object(o.useRef)();$.current=F,Object(o.useEffect)((function(){var e=function(e,t){!e&&t&&V.current&&V.current.setSelection(t.index,t.length),e&&V.current&&Y(Q(e))},t=function(){var e;Y(Q(null===(e=V.current)||void 0===e?void 0:e.getSelection()))};return d.a.addEventListener("editorSelectionChanged",e),d.a.addEventListener("editorTextChanged",t),U(s.a.disableElements([p.a.ANNOTATION_STYLE_POPUP])),function(){d.a.removeEventListener("editorSelectionChanged",e),d.a.removeEventListener("editorTextChanged",t),U(s.a.enableElements([p.a.ANNOTATION_STYLE_POPUP]))}}),[]),Object(o.useEffect)((function(){var e;if(V.current=A,q.current=P,F&&P){var t,n,o,i,r,l,a="solid";try{a="dash"===P.Style?"".concat(P.Style,",").concat(P.Dashes):P.Style}catch(e){console.error(e)}var c=P.getRichTextStyle()[0];G.current={Font:P.Font,FontSize:P.FontSize,TextAlign:P.TextAlign,TextVerticalAlign:P.TextVerticalAlign,bold:null!==(t="bold"===(null==c?void 0:c["font-weight"]))&&void 0!==t&&t,italic:null!==(n="italic"===(null==c?void 0:c["font-style"]))&&void 0!==n&&n,underline:(null==c||null===(o=c["text-decoration"])||void 0===o?void 0:o.includes("underline"))||(null==c||null===(i=c["text-decoration"])||void 0===i?void 0:i.includes("word")),strikeout:null!==(r=null==c||null===(l=c["text-decoration"])||void 0===l?void 0:l.includes("line-through"))&&void 0!==r&&r,size:null==c?void 0:c["font-size"],font:null==c?void 0:c["font-family"],StrokeStyle:a,calculatedFontSize:P.getCalculatedFontSize()}}Y(Q(null===(e=V.current)||void 0===e?void 0:e.getSelection())),J.current&&(V.current.setSelection(J.current),J.current=null)}),[P,A,F]),Object(o.useEffect)((function(){var e=function(){V.current=null,q.current=null,I(!1)},t=function(){I(!0)};return d.a.addEventListener("editorBlur",e),d.a.addEventListener("editorFocus",t),function(){d.a.removeEventListener("editorBlur",e),d.a.removeEventListener("editorFocus",t)}}),[U]);var K,Q=function(e){if(!e)return{};var t=V.current.getFormat(e.index,e.length);if("string"==typeof t.color)t.color=new window.Core.Annotations.Color(t.color);else if(Array.isArray(t.color)){var n=new window.Core.Annotations.Color(t.color[t.color.length-1]);t.color=n}else t.color||(t.color=q.current.TextColor);for(var o=0,i=["font","size","originalSize"];o<i.length;o++){var r=i[o];t[r]&&Array.isArray(t[r])&&(t[r]=void 0)}return t},X=function(e,t){var n,o;"size"===e?null===(n=V.current)||void 0===n||n.format("applyCustomFontSize",t):null===(o=V.current)||void 0===o||o.format(e,t);"color"===e&&(t=new window.Core.Annotations.Color(t)),Y(b(b({},W),{},x({},e,t)))},Z=O.RichTextStyle,ee={bold:null!==(t="bold"===(null==Z||null===(n=Z[0])||void 0===n?void 0:n["font-weight"]))&&void 0!==t&&t,italic:null!==(l="italic"===(null==Z||null===(a=Z[0])||void 0===a?void 0:a["font-style"]))&&void 0!==l&&l,underline:(null==Z||null===(f=Z[0])||void 0===f||null===(y=f["text-decoration"])||void 0===y?void 0:y.includes("underline"))||(null==Z||null===(g=Z[0])||void 0===g||null===(v=g["text-decoration"])||void 0===v?void 0:v.includes("word")),strikeout:null!==(S=null==Z||null===(C=Z[0])||void 0===C||null===(k=C["text-decoration"])||void 0===k?void 0:k.includes("line-through"))&&void 0!==S&&S,font:null==Z||null===(E=Z[0])||void 0===E?void 0:E["font-family"],size:null==Z||null===(T=Z[0])||void 0===T?void 0:T["font-size"],StrokeStyle:"solid"};return K=b(b({},O),ee),F&&P&&(G.current.bold=W.bold,G.current.italic=W.italic,G.current.underline=W.underline,G.current.strikeout=W.strike,G.current.quillFont=W.font||G.current.Font,G.current.quillFontSize=W.originalSize||G.current.FontSize),i.a.createElement("div",{className:"RichTextStyleEditor",onMouseDown:function(e){"touchstart"!==e.type&&F&&e.preventDefault()}},!_&&i.a.createElement("div",{className:"menu-items"},i.a.createElement(m.a,{fonts:M,onPropertyChange:function(e,t){if($.current){var n=V.current.getSelection(),o=n.index,i=n.length,r=q.current;r[e]=t,V.current.blur(),"FontSize"!==e&&"Font"!==e||Object(h.a)(r),setTimeout((function(){J.current={index:o,length:i},d.a.getAnnotationManager().getEditBoxManager().focusBox(r)}),0)}else z(e,t)},onRichTextStyleChange:function(e,t){if($.current){var n={"font-weight":"bold","font-style":"italic",underline:"underline","line-through":"strike","font-family":"font","font-size":"size"};if("font-family"===e||"font-size"===e){X(n[e],t);var o=q.current;if(o.isAutoSized())d.a.getAnnotationManager().getEditBoxManager().resizeAnnotation(o)}else!function(e){return function(){var t=V.current.getSelection(),n=t.index,o=t.length;if(0===o){J.current={index:n,length:o};var i=V.current.getSelection();n=i.index,o=i.length}var r=V.current.getFormat(n,o);X(e,!r[e])}}(n[e])()}else N(e,t)},properties:F?G.current:K,stateless:!0,isFreeText:!L,onFreeTextSizeToggle:R,isFreeTextAutoSize:j,isRichTextEditMode:F,isRedaction:L})),i.a.createElement(c.a,{onColorChange:function(e){!function(e,t){$.current?X("color",t.toHexString()):z(e,t)}("TextColor",new window.Core.Annotations.Color(e))},color:F?W.color:O.TextColor,activeTool:D,type:"Text"}),H)};S.propTypes=v;var C=i.a.memo(S);t.default=C}}]);
//# sourceMappingURL=47.chunk.js.map