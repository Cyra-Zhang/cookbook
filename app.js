
let data=[];
fetch("recipes.json").then(r=>r.json()).then(r=>{data=r;week()});

function card(x){
return `<div class="glass card mode">
<div class="cover">${x.cover}</div>
<div class="body">
<h2>${x.title}</h2>
<p>📅 ${x.day}　⏱ ${x.time}</p>
<div>${x.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
<h3>🥣 食材</h3>
<p>${x.ingredients.join(" · ")}</p>
<h3>👩‍🍳 步骤</h3>
${x.steps.map((s,i)=>`<div class="step">${i+1}. ${s}</div>`).join("")}
</div></div>`
}

function render(list){
content.innerHTML=list.map(card).join("")
}

function week(){
render(data)
}

function ingredients(){
let tags=[...new Set(data.flatMap(x=>x.tags))]
filters.innerHTML=tags.map(t=>`<span class="tag" onclick="find('${t}')">${t}</span>`).join("")
}

function find(t){
render(data.filter(x=>x.tags.includes(t)))
}

function fridge(){
content.innerHTML=`
<div class="glass body mode">
<h2>🧺 我的冰箱</h2>
<p>🥔 土豆</p>
<p>🍗 鸡翅根</p>
<p>🥚 鸡蛋</p>
<p>🥦 西兰花</p>
<h3>推荐</h3>
<p>蒜香土豆鸡翅根盖浇饭</p>
</div>`
}

function cook(){
content.innerHTML=`
<div class="glass body mode">
<h2>👩‍🍳 开始做饭</h2>
<h3>Step 1 / 6</h3>
<p>准备鸡翅根，在表面划刀。</p>
<button onclick="alert('进入下一步')">完成，下一步</button>
</div>`
}
