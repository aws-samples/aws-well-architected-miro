var l=Object.defineProperty;var s=Object.getOwnPropertyDescriptor;var r=Object.getOwnPropertyNames;var y=Object.prototype.hasOwnProperty;var i=(e,t)=>{for(var n in t)l(e,n,{get:t[n],enumerable:!0})},P=(e,t,n,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of r(t))!y.call(e,o)&&o!==n&&l(e,o,{get:()=>t[o],enumerable:!(a=s(t,o))||a.enumerable});return e};var g=e=>P(l({},"__esModule",{value:!0}),e);var x={};i(x,{handler:()=>u});module.exports=g(x);var u=async(e,t)=>(console.log(`Event: ${JSON.stringify(e,null,2)}`),console.log(`Context: ${JSON.stringify(t,null,2)}`),{statusCode:200,body:JSON.stringify({message:"hello world"})});0&&(module.exports={handler});
//# sourceMappingURL=lambda.js.map
