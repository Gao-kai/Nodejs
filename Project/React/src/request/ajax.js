const ajax = new XMLHttpRequest();
ajax.open("get", "https://dog.ceo/api/breeds/image/random");
ajax.onreadystatechange = (e) => {
  if (ajax.readyState === XMLHttpRequest.DONE && ajax.status === 200) {
    const res = JSON.parse(ajax.response);
    console.log(res);
  }
};
ajax.send();
