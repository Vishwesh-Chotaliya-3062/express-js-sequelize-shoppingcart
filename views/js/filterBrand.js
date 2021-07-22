function myFunction() {
    var input, filter, ul, li, la, i, txtValue;
    input = document.getElementById("CompanySearch");
    filter = input.value.toUpperCase(); 
    ul = document.getElementById("myUL");
    li = ul.getElementById("filterCompanyName");

    for (i = 0; i < li.length; i++) { 
      la = li[i].getElementsByTagName("label")[0]; 
      txtValue = la.textContent || la.innerText; 
      if (txtValue.toUpperCase().indexOf(filter) > -1) { 
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }
  
  function myFunction() {
    // 宣告變數
    var input, filter, ul, li, la, i, txtValue;
    input = document.getElementById("CompanySearch");
    filter = input.value.toUpperCase(); //值轉大寫，因為js分大小寫，所以將資料一律轉大寫，用意在於檢核資料不分大小寫，所以改成轉小寫也行
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName("li");
  
    // 用for迴圈跑完結果
    for (i = 0; i < li.length; i++) {  //資料從第一筆(index=0)開始，檢查li的資料筆數是否小於i, 是:i+1 否:停止迴圈
      la = li[i].getElementsByTagName("label")[0]; // 宣告la，以檢視label 的內容
      txtValue = la.textContent || la.innerText;  // || 或的意思， innerText 是IE8之前的專用屬性，如果只用在新瀏覽器可以不用
      if (txtValue.toUpperCase().indexOf(filter) > -1) {  //如果 txtValue 的文字內容在 filter 沒有出現，會傳-1這個值。，用來做比對。
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }
  