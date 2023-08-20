async function getImages() {
  let resp = await fetch('./images.json');
  let content = await resp.json();
  content = content.splice(0,10);

   let list = document.querySelector('.posts');
   list.innerHTML = "";

   let i = 0;
   for( i of content) {
    list.innerHTML += `
        <li class="post">
            <h4>Title: ${i.title}</h4>
            <img src="${i.url}" alt="image" width="300px" />
        </li>`;
   }
}

getImages();