document.addEventListener('DOMContentLoaded', () => {
    
    const firebaseConfig = {
        apiKey: "AIzaSyC2AtnDxjHzIkH8VqMIXzHoJdhFYPCIID4",
        authDomain: "planner-87ec0.firebaseapp.com",
        projectId: "planner-87ec0",
        storageBucket: "planner-87ec0.firebasestorage.app",
        messagingSenderId: "1097422360286",
        appId: "1:1097422360286:web:0fc54bf831e4b9b18e7c4f"
      };

    
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();


    const EMAILJS_SERVICE_ID = "service_2g1n7ps";
    const EMAILJS_TEMPLATE_ID = "template_zpanjxu";
    const EMAILJS_USER_ID = "0ZNk4gV1VJXWXJi5V";
    
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_USER_ID);
    }
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const authError = document.getElementById('auth-error');
    const authSuccess = document.getElementById('auth-success');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');
    const registerUsername = document.getElementById('registerUsername');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');
    const registerConfirmPassword = document.getElementById('registerConfirmPassword');
    const registerBtn = document.getElementById('registerBtn');

    showRegister.addEventListener('click', (e) => { e.preventDefault(); toggleForms(false); });
    showLogin.addEventListener('click', (e) => { e.preventDefault(); toggleForms(true); });

    function toggleForms(showLogin) {
        loginForm.style.display = showLogin ? 'block' : 'none';
        registerForm.style.display = showLogin ? 'none' : 'block';
        authError.textContent = '';
        authSuccess.textContent = '';
    }
    

    function showSuccessAndRedirect(message) {
 
        console.log("DEBUG: A função showSuccessAndRedirect foi chamada com a mensagem:", message); 
    
        authError.textContent = ''; 
        authSuccess.textContent = message;
        authSuccess.classList.add('show'); 
    
        if(loginBtn) loginBtn.disabled = true;
        if(registerBtn) registerBtn.disabled = true;
    
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }

    loginBtn.addEventListener('click', () => {
        auth.signInWithEmailAndPassword(loginEmail.value, loginPassword.value)
            .then(() => {
                showSuccessAndRedirect('Login feito com sucesso! Redirecionando...');
            })
            .catch((error) => {

                console.error("ERRO NO LOGIN:", error); 
    
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    authError.textContent = 'Email ou senha inválidos.';
                } else {
                    authError.textContent = 'Ocorreu um erro ao tentar fazer login.';
                }
            });
    });

    registerBtn.addEventListener('click', () => {

        const username = registerUsername.value;
        const email = registerEmail.value;
        const password = registerPassword.value;
        const confirmPassword = registerConfirmPassword.value;
    
        if (!username || !email || !password || !confirmPassword) {
            authError.textContent = 'Por favor, preencha todos os campos.';
            return;
        }
        if (password !== confirmPassword) {
            authError.textContent = 'As senhas não coincidem!';
            return;
        }
    
        authError.textContent = '';
        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // ... (o conteúdo do .then continua o mesmo)
                const user = userCredential.user;
                user.updateProfile({ displayName: username });
                db.collection('planners').doc(user.uid).set({
                    username: username,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                showSuccessAndRedirect('Conta criada com sucesso! Redirecionando...');
                const templateParams = { username: username, email: email };
                if (typeof emailjs !== 'undefined') {
                    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                       .catch(err => console.error("Erro ao enviar email:", err));
                }
            })
            .catch((error) => {

                console.error("ERRO NO REGISTRO:", error); 
                
                if (error.code == 'auth/email-already-in-use') {
                    authError.textContent = 'Este email já está em uso.';
                } else {
                    authError.textContent = 'Erro ao registrar: ' + error.message;
                }
            });
    });
});