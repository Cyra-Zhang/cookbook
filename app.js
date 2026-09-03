fetch('recipes.json').then(r=>r.json()).then(data=>{
let app=document.getElementById('app');
let tags=[...new Set(data.map(x=>x.date))];
document.getElementById('tags').innerHTML=tags.map(t=>`<span class="tag" onclick="show('${t}')">${t}</span>`).join('');
window.show=(d)=>render(data.filter(x=>x.date==d));
function render(list=data){
app.innerHTML=list.map(x=>`
<div class="card">
<div class="title">${x.title}</div>
<div class="badge">${x.date} ${x.meal}</div>
<div class="badge">⏱${x.time}</div>
<h3>🥣 食材</h3><div class="info">${x.ingredients}</div>
<h3>👩‍🍳 详细步骤</h3><div class="steps">${x.steps}</div>
<h3>📝 备菜提醒</h3><div class="info">${x.prep||''}</div>
</div>`).join('')
}
render();
})