(()=>{'use strict';const select=document.getElementById('themeSelect');if(!select)return;
const gallery=document.createElement('section');gallery.className='theme-gallery';const title=document.createElement('h3');title.textContent='Bộ sưu tập viền Pro';const samples=document.createElement('div');samples.className='theme-samples';
for(const [id,name,desc]of [['titanium','Titanium','Bạc kim loại'],['obsidian','Obsidian','Đen · ngọc lục bảo'],['champagne','Champagne','Vàng ánh kim'],['sapphire','Sapphire','Xanh sapphire']]){const b=document.createElement('button'),swatch=document.createElement('span'),label=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');b.type='button';b.dataset.preset=id;swatch.className='theme-swatch';swatch.setAttribute('aria-hidden','true');strong.textContent=name;small.textContent=desc;label.append(strong,small);b.append(swatch,label);b.onclick=()=>{select.value=id;select.dispatchEvent(new Event('change',{bubbles:true}));};samples.append(b);}
gallery.append(title,samples);select.closest('label').after(gallery);
function sync(){for(const b of samples.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.preset===document.body.dataset.theme));}
new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-theme']});sync();
})();
