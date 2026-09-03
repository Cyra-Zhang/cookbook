
fetch("recipes.json").then(r=>r.json()).then(data=>{
document.getElementById("app").innerHTML=data.map(x=>`
<div class="glass card">
<div class="cover">${x.image}</div>
<div class="content">
<h2>${x.title}</h2>
<p>${x.day} · ${x.time}</p>
<p>${x.ingredients.join(" · ")}</p>
<h3>步骤</h3>
${x.steps.map((s,i)=>`<p>${i+1}. ${s}</p>`).join("")}
</div>
</div>`).join("")
})
