const formSubmit = document.querySelector('#form-1');
const nameInput = document.querySelector('#fullname');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');

// formSubmit.addEventListener('submit', async (e)=> {
//     e.preventDefault();
//     const name = nameInput.value;
//     const email = emailInput.value;
//     const password = passwordInput.value;


//     register(name, email, password)

//     // try {
//     //     const response = await axios.post('http://127.0.0.1:3000/api/v1/register', {name, email, password})
//     //     alert("register successful!")
//     //     console.log(response)
//     // } catch (error) {
//     //     console.log(error.response)
//     // }
// })


const register = async (name, email, password) => {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
  
      const data = await response.json();
      if (response.ok) {
        // Xử lí phản hồi thành công
        window.location.href = "/client/login.html"
        alert("Đăng ký thành công")
        console.log(response);
      } 
      else if (response.status === 409) {
        alert('Tài khoản đã tồn tại !');
        console.log(response);
      }else {
        // Xử lí phản hồi lỗi
        console.error(data.message);
      }
    } catch (error) {
      console.error('Đã xảy ra lỗi:', error.message);
    }
  };