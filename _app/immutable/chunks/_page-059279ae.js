//js
import{b as e}from"./paths-6cd3a76e.js";import{a as r,g as s}from"./utils-b798134b.js";const l=!0;async function n({fetch:a}){let t=await r(`${e}/data/places.csv`,a),o=await s(`${e}/data/json/default.json`,a);return{places:t,place:o}}const d=Object.freeze(Object.defineProperty({__proto__:null,prerender:l,load:n},Symbol.toStringTag,{value:"Module"}));export{d as _,n as l,l as p};
