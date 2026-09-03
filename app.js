
let data=[];
let filter="";
fetch("recipes.json").then(r=>r.json()).then(d=>{
data=d;
renderTags();
render();
recommend();
});

function renderTags(){
let t=[...new Set(data.flatMap(x=>x.tags))];
tags.innerHTML=t.map(x=>`<span class="tag" onclick="choose('${x}')">${x}</span>`).join("");
}

function choose(t){
filter=filter===t?"":t;
render();
}

function recommend(){
recommend.innerHTML=`
<div class="card">
<div class="content">
<div class="title">🍗 蒜香土豆鸡翅根盖浇饭</div>
<p>今天推荐：30分钟完成，一人份，不容易剩。</p>
</div></div>`;
}

function render(){
recipes.innerHTML=data.filter(x=>!filter||x.tags.includes(filter)).map(x=>`
<div class="card" onclick="this.classList.toggle('open')">
<div class="photo">${x.emoji}</div>
<div class="content">
<div class="title">${x.title}</div>
<div class="badge">⏱ ${x.time}</div>
<div class="badge">⭐ ${x.level}</div>
<p>🥣 ${x.material}</p>
<button>查看步骤</button>
<div class="detail">
<h3>做法</h3>
${x.step}
</div>
</div>
</div>`).join("");
}
