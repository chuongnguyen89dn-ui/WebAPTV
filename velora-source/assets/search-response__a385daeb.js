(()=>{'use strict';
window.VeloraSearchResponse=async response=>{
 const raw=await response.text();let data;
 try{data=JSON.parse(raw);}catch(_){
  const code=response.status;
  const reason=code===404?'Không tìm thấy dịch vụ tìm kiếm trên hosting.':code===403?'Hosting đang từ chối yêu cầu tìm kiếm.':code===429?'Có quá nhiều yêu cầu tìm kiếm. Hãy thử lại sau.':code>=500?'Dịch vụ tìm kiếm trên hosting đang gặp lỗi.':'Dịch vụ tìm kiếm trả về trang web thay vì dữ liệu.';
  const error=Error(reason+' (HTTP '+code+'). Bạn có thể chọn Bài gần đây trong lúc chờ.');
  error.retryable=[502,503,504].includes(code);throw error;
 }
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Dịch vụ tìm kiếm trả về dữ liệu không hợp lệ.');
 if(!response.ok||!data.ok)throw Error(typeof data.error==='string'?data.error:'Không tải được danh sách YouTube. Vui lòng thử lại.');
 return data;
};
const requests=new Map();
window.VeloraSearchRequest=raw=>{
 const query=String(raw).trim().replace(/\s+/g,' ').toLocaleLowerCase('vi'),key='velora-search242:'+query;
 if(requests.has(query))return requests.get(query);
 const task=(async()=>{
  let saved;try{saved=JSON.parse(localStorage.getItem(key)||'null');}catch(_){}
  if(saved&&saved.data?.ok&&Array.isArray(saved.data.items)&&Date.now()-saved.time<86400000)return saved.data;
  try{
   for(let attempt=0;attempt<2;attempt++){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
    try{
     const response=await fetch('api/search.php?q='+encodeURIComponent(query),{cache:'no-store',signal:controller.signal});
     const data=await window.VeloraSearchResponse(response);
     if(!data.stale){try{localStorage.setItem(key,JSON.stringify({time:Date.now(),data}));}catch(_){}}
     return data;
    }catch(error){
     if(error.name==='AbortError')throw Error('Tìm kiếm quá thời gian. Vui lòng thử lại hoặc chọn Bài gần đây.');
     if(attempt===0&&error.retryable){await new Promise(resolve=>setTimeout(resolve,400));continue;}
     throw error;
    }finally{clearTimeout(timer);}
   }
  }catch(error){
   const local=window.VeloraMusicLibrary?.search(query)||[];
   if(local.length)return {ok:true,items:local,stale:true,warning:'Kết quả trong bài đã lưu. Chọn Tìm trên YouTube để tìm thêm.'};
   if(saved&&saved.data?.ok&&Array.isArray(saved.data.items)&&Date.now()-saved.time<86400000)return {...saved.data,stale:true,warning:'Đang dùng kết quả đã lưu vì dịch vụ tìm kiếm chưa sẵn sàng.'};
   if(error instanceof TypeError)throw Error('Không kết nối được dịch vụ tìm kiếm. Kiểm tra mạng hoặc chọn Bài gần đây.');
   throw error;
  }
 })().finally(()=>requests.delete(query));
 requests.set(query,task);return task;
};
})();
