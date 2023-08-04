const formSubmit = document.querySelector("#form-2");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");


function setHttpOnlyCookie(name, value, expiresIn) {
  const expiration = new Date(Date.now() + expiresIn * 1000).toUTCString();
  const cookie = `${name}=${value}; expires=${expiration}; path=/; secure; HttpOnly`;
  document.cookie = cookie;
}

const login = async (email, password) => {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      if (response.ok) {
        const accessToken = data.accessToken;
        setHttpOnlyCookie('access_token', accessToken, 3600)
        const refreshToken = data.refreshToken;
        setHttpOnlyCookie('refresh_token', refreshToken, 7*24*3600)
        // Xử lí phản hồi thành công
        alert("đăng nhập thành công!")
      } 
      else if (response) {
        alert('thông tin đăng nhập không chính xác !');
      }else {
        // Xử lí phản hồi lỗi
        alert(data.message);
      }
    } catch (error) {
      console.error('Đã xảy ra lỗi:', error.message);
    }
  };

//   login(e)
// try {
//     const response = await axios.post("http://127.0.0.1:3000/api/v1/login", {
//       email,
//       password,
//     });
//     console.log(response);
//     const data = await response.json();
//     if (response.ok) {
//         // Xử lí phản hồi thành công
//         alert("register successful!");
//       console.log(data);
//     } else {
//       // Xử lí phản hồi lỗi
//       console.error(data.message);
//     }
//   } catch (error) {
//     console.log(error.message);
//   }