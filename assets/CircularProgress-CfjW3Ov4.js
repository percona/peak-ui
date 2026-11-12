var r=Object.defineProperty,__name=(e,t)=>r(e,"name",{value:t,configurable:!0});import{y as e,x as t,r as a,u as s,j as i,l as o,m as n,L as l,M as c}from"./iframe-xm16dDCc.js";import{s as d,c as m,m as p,a as u}from"./createSimplePaletteValueFilter-CpZVKi9w.js";function getCircularProgressUtilityClass(r){return e("MuiCircularProgress",r)}__name(getCircularProgressUtilityClass,"getCircularProgressUtilityClass"),t("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","track","circle","circleDeterminate","circleIndeterminate","circleDisableShrink"]);const f=44,v=c`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`,h=c`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: -126px;
  }
`,k="string"!=typeof v?l`
        animation: ${v} 1.4s linear infinite;
      `:null,y="string"!=typeof h?l`
        animation: ${h} 1.4s ease-in-out infinite;
      `:null,g=__name(r=>{const{classes:e,variant:t,color:a,disableShrink:s}=r,i={root:["root",t,`color${n(a)}`],svg:["svg"],track:["track"],circle:["circle",`circle${n(t)}`,s&&"circleDisableShrink"]};return m(i,getCircularProgressUtilityClass,e)},"useUtilityClasses"),x=d("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:__name((r,e)=>{const{ownerState:t}=r;return[e.root,e[t.variant],e[`color${n(t.color)}`]]},"overridesResolver")})(p(({theme:r})=>({display:"inline-block",variants:[{props:{variant:"determinate"},style:{transition:r.transitions.create("transform")}},{props:{variant:"indeterminate"},style:k||{animation:`${v} 1.4s linear infinite`}},...Object.entries(r.palette).filter(u()).map(([e])=>({props:{color:e},style:{color:(r.vars||r).palette[e].main}}))]}))),C=d("svg",{name:"MuiCircularProgress",slot:"Svg"})({display:"block"}),S=d("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:__name((r,e)=>{const{ownerState:t}=r;return[e.circle,e[`circle${n(t.variant)}`],t.disableShrink&&e.circleDisableShrink]},"overridesResolver")})(p(({theme:r})=>({stroke:"currentColor",variants:[{props:{variant:"determinate"},style:{transition:r.transitions.create("stroke-dashoffset")}},{props:{variant:"indeterminate"},style:{strokeDasharray:"80px, 200px",strokeDashoffset:0}},{props:__name(({ownerState:r})=>"indeterminate"===r.variant&&!r.disableShrink,"props"),style:y||{animation:`${h} 1.4s ease-in-out infinite`}}]}))),P=d("circle",{name:"MuiCircularProgress",slot:"Track"})(p(({theme:r})=>({stroke:"currentColor",opacity:(r.vars||r).palette.action.activatedOpacity}))),b=a.forwardRef(__name(function CircularProgress2(r,e){const t=s({props:r,name:"MuiCircularProgress"}),{className:a,color:n="primary",disableShrink:l=!1,enableTrackSlot:c=!1,size:d=40,style:m,thickness:p=3.6,value:u=0,variant:v="indeterminate",...h}=t,k={...t,color:n,disableShrink:l,size:d,thickness:p,value:u,variant:v,enableTrackSlot:c},y=g(k),b={},w={},M={};if("determinate"===v){const r=2*Math.PI*((f-p)/2);b.strokeDasharray=r.toFixed(3),M["aria-valuenow"]=Math.round(u),b.strokeDashoffset=`${((100-u)/100*r).toFixed(3)}px`,w.transform="rotate(-90deg)"}return i.jsx(x,{className:o(y.root,a),style:{width:d,height:d,...w,...m},ownerState:k,ref:e,role:"progressbar",...M,...h,children:i.jsxs(C,{className:y.svg,ownerState:k,viewBox:"22 22 44 44",children:[c?i.jsx(P,{className:y.track,ownerState:k,cx:f,cy:f,r:(f-p)/2,fill:"none",strokeWidth:p,"aria-hidden":"true"}):null,i.jsx(S,{className:y.circle,style:b,ownerState:k,cx:f,cy:f,r:(f-p)/2,fill:"none",strokeWidth:p})]})})},"CircularProgress2"));export{b as C};
