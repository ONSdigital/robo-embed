//js
import{b as e}from"./paths.b4846f44.js";import{a as r,g as s}from"./utils.7e0c2ea5.js";const l=!0;async function n({fetch:a}){let t=await r(`${e}/data/places.csv`,a),o=await s(`${e}/data/json/default.json`,a);return{places:t,place:o}}const d=Object.freeze(Object.defineProperty({__proto__:null,load:n,prerender:l},Symbol.toStringTag,{value:"Module"}));export{d as _,n as l,l as p};
