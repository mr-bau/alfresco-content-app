(window.webpackJsonp=window.webpackJsonp||[]).push([[51],{1796:function(o,e,t){var n=t(31),r=t(1797);"string"==typeof(r=r.__esModule?r.default:r)&&(r=[[o.i,r,""]]);var i={insert:function(o){if(!window.isApryseWebViewerWebComponent)return void document.head.appendChild(o);let e;e=document.getElementsByTagName("apryse-webviewer"),e.length||(e=function o(e,t=document){const n=[];return t.querySelectorAll(e).forEach(o=>n.push(o)),t.querySelectorAll("*").forEach(t=>{t.shadowRoot&&n.push(...o(e,t.shadowRoot))}),n}("apryse-webviewer"));const t=[];for(let n=0;n<e.length;n++){const r=e[n];if(0===n)r.shadowRoot.appendChild(o),o.onload=function(){t.length>0&&t.forEach(e=>{e.innerHTML=o.innerHTML})};else{const e=o.cloneNode(!0);r.shadowRoot.appendChild(e),t.push(e)}}},singleton:!1};n(r,i);o.exports=r.locals||{}},1797:function(o,e,t){(e=o.exports=t(32)(!1)).push([o.i,".open.ColorPickerModal{visibility:visible}.closed.ColorPickerModal{visibility:hidden}:host{display:inline-block;container-type:inline-size;width:100%;height:100%;overflow:hidden}@media(min-width:901px){.App:not(.is-web-component) .hide-in-desktop{display:none}}@container (min-width: 901px){.hide-in-desktop{display:none}}@media(min-width:641px)and (max-width:900px){.App:not(.is-in-desktop-only-mode):not(.is-web-component) .hide-in-tablet{display:none}}@container (min-width: 641px) and (max-width: 900px){.App.is-web-component:not(.is-in-desktop-only-mode) .hide-in-tablet{display:none}}@media(max-width:640px)and (min-width:431px){.App:not(.is-web-component) .hide-in-mobile{display:none}}@container (max-width: 640px) and (min-width: 431px){.App.is-web-component .hide-in-mobile{display:none}}@media(max-width:430px){.App:not(.is-web-component) .hide-in-small-mobile{display:none}}@container (max-width: 430px){.App.is-web-component .hide-in-small-mobile{display:none}}.always-hide{display:none}.ColorPickerModal{position:fixed;left:0;bottom:0;z-index:100;width:100%;height:100%;display:flex;justify-content:center;align-items:center;background:var(--modal-negative-space)}.ColorPickerModal .modal-container .wrapper .modal-content{padding:10px}.ColorPickerModal .footer{display:flex;flex-direction:row;justify-content:flex-end;width:100%;margin-top:13px}.ColorPickerModal .footer.modal-footer{padding:16px;margin:0;border-top:1px solid var(--divider)}.ColorPickerModal .footer .modal-button{display:flex;justify-content:center;align-items:center;padding:6px 18px;margin:8px 0 0;width:auto;width:-webkit-fit-content;width:-moz-fit-content;width:fit-content;border-radius:4px;height:30px;cursor:pointer}.ColorPickerModal .footer .modal-button.cancel{color:var(--secondary-button-text);border:1px solid var(--secondary-button-text)}.ColorPickerModal .footer .modal-button.cancel:hover{background-color:var(--document-background-color);color:var(--secondary-button-hover);border:1px solid var(--secondary-button-hover)}.ColorPickerModal .footer .modal-button.confirm{margin-left:4px;color:var(--primary-button-text);font-weight:600;background:var(--primary-button)}.ColorPickerModal .footer .modal-button.confirm:hover{background:var(--primary-button-hover)}.ColorPickerModal .footer .modal-button.confirm.disabled{background:var(--primary-button)!important;opacity:.5}.ColorPickerModal .footer .modal-button.secondary-btn-custom{border-radius:4px;border:1px solid var(--primary-button);color:var(--primary-button);padding:2px 20px 4px;cursor:pointer;background-color:#fff}.ColorPickerModal .footer .modal-button.secondary-btn-custom:hover{color:var(--secondary-button-hover)}@media(max-width:640px){.App:not(.is-in-desktop-only-mode):not(.is-web-component) .ColorPickerModal .footer .modal-button{padding:23px 8px}}@container (max-width: 640px){.App.is-web-component:not(.is-in-desktop-only-mode) .ColorPickerModal .footer .modal-button{padding:23px 8px}}.ColorPickerModal .swipe-indicator{background:var(--divider);border-radius:2px;height:4px;width:38px;position:absolute;top:12px;margin-left:auto;margin-right:auto;left:0;right:0}@media(min-width:641px){.App:not(.is-in-desktop-only-mode):not(.is-web-component) .ColorPickerModal .swipe-indicator{display:none}}@container (min-width: 641px){.App.is-web-component:not(.is-in-desktop-only-mode) .ColorPickerModal .swipe-indicator{display:none}}.ColorPickerModal .container{overflow-y:auto;max-height:100%}@media(max-height:500px){.App:not(.is-web-component) .ColorPickerModal .container,.ColorPickerModal .App:not(.is-web-component) .container{overflow:auto;max-height:100%}}@container (max-height: 500px){.App.is-web-component .ColorPickerModal .container,.ColorPickerModal .App.is-web-component .container{overflow:auto;max-height:100%}}@media(max-width:640px){.App:not(.is-in-desktop-only-mode):not(.is-web-component) .ColorPickerModal .container,.ColorPickerModal .App:not(.is-in-desktop-only-mode):not(.is-web-component) .container{width:100%;position:fixed;left:0;bottom:0;padding-top:4px;min-width:100px}}@container (max-width: 640px){.App.is-web-component:not(.is-in-desktop-only-mode) .ColorPickerModal .container,.ColorPickerModal .App.is-web-component:not(.is-in-desktop-only-mode) .container{width:100%;position:fixed;left:0;bottom:0;padding-top:4px;min-width:100px}}.ColorPickerModal .container{display:flex;flex-direction:column;justify-content:center;align-items:center;box-shadow:0 0 3px 0 var(--document-box-shadow);background:var(--component-background);padding:15px 16px;border-radius:4px;width:250px}@media(max-width:640px){.App:not(.is-in-desktop-only-mode):not(.is-web-component) .ColorPickerModal .container{padding:24px 24px 16px}}@container (max-width: 640px){.App.is-web-component:not(.is-in-desktop-only-mode) .ColorPickerModal .container{padding:24px 24px 16px}}.ColorPickerModal .container .sketch-picker{border-radius:0!important;box-shadow:none!important;width:220px!important;padding:0!important;background:var(--component-background)!important}.ColorPickerModal .container .sketch-picker>div{border-radius:2px!important}.ColorPickerModal .container .sketch-picker .saturation-white>div>div{width:12px!important;height:12px!important;transform:translateX(-6px) translateY(-6px)!important}.ColorPickerModal .container .sketch-picker .flexbox-fix:nth-child(2) span{color:var(--text-color)!important;cursor:default!important}.ColorPickerModal .container .sketch-picker .flexbox-fix:nth-child(2)>div:first-child{border-radius:2px}.ColorPickerModal .container .sketch-picker .flexbox-fix:nth-child(2)>div:first-child>div{margin-top:6px;cursor:ew-resize!important;overflow:visible!important}.ColorPickerModal .container .sketch-picker .flexbox-fix:nth-child(2) .hue-horizontal{width:97%;border-radius:2px}.ColorPickerModal .container .sketch-picker .flexbox-fix:nth-child(2) .hue-horizontal div div{transform:translateX(-7px) translateY(-3px)!important;height:14px!important;width:14px!important;border-radius:14px!important}.ColorPickerModal .container .sketch-picker .flexbox-fix:nth-child(2)>div:nth-child(2){height:24px!important;border-radius:12px!important}.ColorPickerModal .container .sketch-picker .flexbox-fix:nth-child(2)>div:nth-child(2)>div{border-radius:12px!important}.ColorPickerModal .container .sketch-picker .flexbox-fix:nth-child(3) input{width:100%!important;text-align:center;border-radius:2px;box-shadow:var(--border) 0 0 0 1px inset!important}.ColorPickerModal .container .sketch-picker .flexbox-fix:nth-child(3) label{color:var(--text-color)!important}.ColorPickerModal .container .buttons{width:220px;text-align:right;font-size:13px;margin-top:20px;display:flex;justify-content:flex-end}.ColorPickerModal .container .buttons .save-button{background-color:transparent;color:var(--primary-button-text);padding:6px 16px;background:var(--primary-button);border-radius:4px;border:0;height:32px;cursor:pointer}.ColorPickerModal .container .buttons .cancel-button{cursor:pointer;background:none;border:0;color:var(--secondary-button-text);padding:6px 16px;margin-right:4px;height:32px}.ColorPickerModal .container .buttons .cancel-button:hover{color:var(--secondary-button-hover)}.ColorPickerModal .container .buttons .cancel-button:focus{outline:none}",""]),e.locals={LEFT_HEADER_WIDTH:"41px",RIGHT_HEADER_WIDTH:"41px"}},1848:function(o,e,t){"use strict";t.r(e);t(19),t(12),t(14),t(7),t(13),t(9),t(10),t(11),t(16),t(15),t(20),t(17),t(28),t(29),t(26),t(22),t(34),t(33),t(54),t(23),t(24),t(56),t(55);var n=t(0),r=t.n(n),i=t(3),a=t(2),l=t(6),c=(t(77),t(18)),d=t.n(c),p=t(398),s=t(1830),u=t(164),b=t(5);t(1796);function m(o,e){return function(o){if(Array.isArray(o))return o}(o)||function(o,e){var t=null==o?null:"undefined"!=typeof Symbol&&o[Symbol.iterator]||o["@@iterator"];if(null!=t){var n,r,i,a,l=[],c=!0,d=!1;try{if(i=(t=t.call(o)).next,0===e){if(Object(t)!==t)return;c=!1}else for(;!(c=(n=i.call(t)).done)&&(l.push(n.value),l.length!==e);c=!0);}catch(o){d=!0,r=o}finally{try{if(!c&&null!=t.return&&(a=t.return(),Object(a)!==a))return}finally{if(d)throw r}}return l}}(o,e)||function(o,e){if(!o)return;if("string"==typeof o)return f(o,e);var t=Object.prototype.toString.call(o).slice(8,-1);"Object"===t&&o.constructor&&(t=o.constructor.name);if("Map"===t||"Set"===t)return Array.from(o);if("Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return f(o,e)}(o,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function f(o,e){(null==e||e>o.length)&&(e=o.length);for(var t=0,n=new Array(e);t<e;t++)n[t]=o[t];return n}var h=function(o){var e=o.isDisabled,t=o.isOpen,i=o.color,a=o.closeModal,l=o.handleChangeSave,c=o.handleChangeCancel,f=m(Object(p.a)(),1)[0],h=m(Object(n.useState)({}),2),x=h[0],y=h[1],w=d()({Modal:!0,ColorPickerModal:!0,open:t,closed:!t});Object(n.useEffect)((function(){i&&0!==i.A?y({r:i.R,g:i.G,b:i.B,a:1}):y({r:0,g:0,b:0,a:1})}),[i]);return e?null:r.a.createElement(u.a,{onSwipedUp:a,onSwipedDown:a,preventDefaultTouchmoveEvent:!0},r.a.createElement("div",{className:w,"data-element":b.a.COLOR_PICKER_MODAL,onMouseDown:a},r.a.createElement("div",{className:"container",onMouseDown:function(o){return o.stopPropagation()}},r.a.createElement("div",{className:"swipe-indicator"}),r.a.createElement(s.a,{color:x,disableAlpha:!0,onChange:function(o){y(o.rgb)},presetColors:[]}),r.a.createElement("div",{className:"buttons"},r.a.createElement("button",{className:"cancel-button",onClick:c},f("action.cancel")),r.a.createElement("button",{className:"save-button",onClick:function(){l(x)}},f("action.ok"))))))};function x(o){return(x="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o})(o)}var y=["closeColorPicker","onColorChange"];function w(o,e){var t=Object.keys(o);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(o);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(o,e).enumerable}))),t.push.apply(t,n)}return t}function v(o){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?w(Object(t),!0).forEach((function(e){g(o,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(o,Object.getOwnPropertyDescriptors(t)):w(Object(t)).forEach((function(e){Object.defineProperty(o,e,Object.getOwnPropertyDescriptor(t,e))}))}return o}function g(o,e,t){return(e=function(o){var e=function(o,e){if("object"!==x(o)||null===o)return o;var t=o[Symbol.toPrimitive];if(void 0!==t){var n=t.call(o,e||"default");if("object"!==x(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(o)}(o,"string");return"symbol"===x(e)?e:String(e)}(e))in o?Object.defineProperty(o,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):o[e]=t,o}function k(o,e){if(null==o)return{};var t,n,r=function(o,e){if(null==o)return{};var t,n,r={},i=Object.keys(o);for(n=0;n<i.length;n++)t=i[n],e.indexOf(t)>=0||(r[t]=o[t]);return r}(o,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(o);for(n=0;n<i.length;n++)t=i[n],e.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(o,t)&&(r[t]=o[t])}return r}var C=function(o){var e=o.closeColorPicker,t=o.onColorChange,i=k(o,y),a=Object(n.useCallback)((function(){e()}),[e]),l=Object(n.useCallback)((function(){e()}),[e]),c=v(v({},i),{},{closeModal:a,handleChangeSave:function(o){t(o),e()},handleChangeCancel:l});return r.a.createElement(h,c)};function P(o){return(P="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o})(o)}function O(o,e){var t=Object.keys(o);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(o);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(o,e).enumerable}))),t.push.apply(t,n)}return t}function M(o){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?O(Object(t),!0).forEach((function(e){j(o,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(o,Object.getOwnPropertyDescriptors(t)):O(Object(t)).forEach((function(e){Object.defineProperty(o,e,Object.getOwnPropertyDescriptor(t,e))}))}return o}function j(o,e,t){return(e=function(o){var e=function(o,e){if("object"!==P(o)||null===o)return o;var t=o[Symbol.toPrimitive];if(void 0!==t){var n=t.call(o,e||"default");if("object"!==P(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(o)}(o,"string");return"symbol"===P(e)?e:String(e)}(e))in o?Object.defineProperty(o,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):o[e]=t,o}function A(o,e){return function(o){if(Array.isArray(o))return o}(o)||function(o,e){var t=null==o?null:"undefined"!=typeof Symbol&&o[Symbol.iterator]||o["@@iterator"];if(null!=t){var n,r,i,a,l=[],c=!0,d=!1;try{if(i=(t=t.call(o)).next,0===e){if(Object(t)!==t)return;c=!1}else for(;!(c=(n=i.call(t)).done)&&(l.push(n.value),l.length!==e);c=!0);}catch(o){d=!0,r=o}finally{try{if(!c&&null!=t.return&&(a=t.return(),Object(a)!==a))return}finally{if(d)throw r}}return l}}(o,e)||function(o,e){if(!o)return;if("string"==typeof o)return S(o,e);var t=Object.prototype.toString.call(o).slice(8,-1);"Object"===t&&o.constructor&&(t=o.constructor.name);if("Map"===t||"Set"===t)return Array.from(o);if("Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return S(o,e)}(o,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function S(o,e){(null==e||e>o.length)&&(e=o.length);for(var t=0,n=new Array(e);t<e;t++)n[t]=o[t];return n}var E=function(o){var e=Object(l.d)(),t=A(Object(l.e)((function(o){return[i.a.isElementDisabled(o,"ColorPickerModal"),i.a.isElementOpen(o,"ColorPickerModal"),i.a.getCustomColor(o)]})),3),n=t[0],c=t[1],d=t[2],p=M(M({},o),{},{color:d,onColorChange:function(o){var t=new window.Core.Annotations.Color(o.r,o.g,o.b,o.a);e(a.a.setCustomColor(t))},isDisabled:n,closeColorPicker:function(){e(a.a.closeElement("ColorPickerModal"))},isOpen:c});return r.a.createElement(C,p)};e.default=E}}]);
//# sourceMappingURL=51.chunk.js.map