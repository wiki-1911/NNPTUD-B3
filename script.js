const API = "https://api.escuelajs.co/api/v1/products";

let products = [];
let filtered = [];
let page = 1;
let pageSize = 10;
let sortState = { title: false, price: false };

// LOAD DATA
async function loadData() {
  const res = await fetch(API);
  products = await res.json();
  filtered = [...products];
  render();
}

// RENDER TABLE + PAGINATION
function render() {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = filtered.slice(start, end);

  const tbody = document.getElementById("tbody");
  tbody.innerHTML = "";

  data.forEach(p => {
    const tr = document.createElement("tr");
    tr.title = p.description; // hover description

    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>$${p.price}</td>
      <td>${p.category?.name || ""}</td>
      <td>
        <img src="${p.images[0]}" width="50">
      </td>
    `;

    tr.onclick = () => openDetail(p);
    tbody.appendChild(tr);
  });

  renderPagination();
}

// PAGINATION
function renderPagination() {
  const totalPages = Math.ceil(filtered.length / pageSize);
  const pag = document.getElementById("pagination");
  pag.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = "page-item" + (i === page ? " active" : "");
    li.innerHTML = `<a class="page-link">${i}</a>`;
    li.onclick = () => { page = i; render(); };
    pag.appendChild(li);
  }
}

// SEARCH
document.getElementById("searchInput").oninput = (e) => {
  const txt = e.target.value.toLowerCase();
  filtered = products.filter(p => p.title.toLowerCase().includes(txt));
  page = 1;
  render();
};

// PAGE SIZE
document.getElementById("pageSize").onchange = (e) => {
  pageSize = +e.target.value;
  page = 1;
  render();
};

// SORT TITLE
document.getElementById("sortTitle").onclick = () => {
  sortState.title = !sortState.title;
  filtered.sort((a,b) =>
    sortState.title ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
  );
  render();
};

// SORT PRICE
document.getElementById("sortPrice").onclick = () => {
  sortState.price = !sortState.price;
  filtered.sort((a,b) =>
    sortState.price ? a.price - b.price : b.price - a.price
  );
  render();
};

// EXPORT CSV (current view)
document.getElementById("btnExport").onclick = () => {
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  let csv = "id,title,price,category\n";
  data.forEach(p => {
    csv += `${p.id},"${p.title}",${p.price},"${p.category?.name || ""}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "products.csv";
  a.click();
};

// OPEN DETAIL MODAL
function openDetail(p) {
  document.getElementById("editId").value = p.id;
  document.getElementById("editTitle").value = p.title;
  document.getElementById("editPrice").value = p.price;
  document.getElementById("editDesc").value = p.description;

  window.currentImages = p.images;

  const imgDiv = document.getElementById("editImages");
  imgDiv.innerHTML = p.images.map(
    img => `<img src="${img}" width="80">`
  ).join("");

  new bootstrap.Modal(document.getElementById("detailModal")).show();
}


document.getElementById("btnUpdate").onclick = async () => {
  const id = document.getElementById("editId").value;

  const body = {
    title: document.getElementById("editTitle").value,
    price: Number(document.getElementById("editPrice").value),
    description: document.getElementById("editDesc").value,
    categoryId: 1,   // BẮT BUỘC có
    images: window.currentImages || [
      "https://placeimg.com/640/480/any"
    ]
  };

  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  console.log("Update response:", data);

  alert("Cập nhật thành công!");

  // đóng modal
  bootstrap.Modal.getInstance(
    document.getElementById("detailModal")
  ).hide();

  loadData();
};


// CREATE PRODUCT (POST)
document.getElementById("btnCreate").onclick = async () => {
  const body = {
    title: cTitle.value,
    price: +cPrice.value,
    description: cDesc.value,
    categoryId: 1,
    images: [cImage.value]
  };

  await fetch(API, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body)
  });

  alert("Created!");
  loadData();
};

// INIT
loadData();
