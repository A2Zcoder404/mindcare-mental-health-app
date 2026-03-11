import { auth, googleProvider, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {


    // Password Visibility Toggle
    const toggleButtons = document.querySelectorAll('.toggle-password');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            // Get the input element that is an immediate sibling to this button
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('ri-eye-off-line');
                icon.classList.add('ri-eye-line');
            } else {
                input.type = 'password';
                icon.classList.remove('ri-eye-line');
                icon.classList.add('ri-eye-off-line');
            }
        });
    });

    // --- Firebase Auth Logic ---
    const loginFormElement = document.getElementById('login-form-element');
    const signupFormElement = document.getElementById('signup-form-element');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const googleSignupBtn = document.getElementById('google-signup-btn');

    // Check for redirect result from Google Login fallback
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
            const { user } = result;
            // Save profile if it's new
            await setDoc(doc(db, 'users', user.uid), {
                fullName: user.displayName,
                email: user.email,
                lastLoginAt: serverTimestamp()
            }, { merge: true });
            
            const docSnap = await getDoc(doc(db, 'users', user.uid));
            if (docSnap.exists() && docSnap.data().onboardingComplete) {
                window.location.href = 'index.html';
            } else {
                window.location.href = 'onboarding.html';
            }
        }
      }).catch((error) => {
        console.error("Redirect login failed:", error);
      });

    // Monitor Auth State
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Only auto-redirect if their email is verified or they used Google
            if (user.providerData.some(p => p.providerId === 'google.com') || user.emailVerified) {
                try {
                    const docSnap = await getDoc(doc(db, 'users', user.uid));
                    if (docSnap.exists() && docSnap.data().onboardingComplete) {
                        window.location.href = 'index.html';
                    } else {
                        // Avoid redirect loops if we are already on onboarding
                        if (!window.location.href.includes('onboarding.html') && !window.location.href.includes('assessment.html') && !window.location.pathname.endsWith('/')) {
                            window.location.href = 'onboarding.html';
                        }
                    }
                } catch (error) {
                    console.error("Error checking onboarding status:", error);
                    window.location.href = 'onboarding.html';
                }
            } else {
                // If not verified, hide loader but do not redirect.
                if (window.hideLoader) window.hideLoader(true);
                
                // Show verification UI if available (user is on login or signup page)
                const verificationWait = document.getElementById('verification-wait');
                const signupForm = document.getElementById('signup-form');
                const loginForm = document.getElementById('login-form');
                
                if (verificationWait) {
                   if (signupForm) signupForm.classList.remove('active');
                   if (loginForm) loginForm.classList.remove('active');
                   verificationWait.style.display = 'block';
                   
                   // Setup Resend Button safely
                   const resendBtn = document.getElementById('resend-verification-btn');
                   const newResendBtn = resendBtn.cloneNode(true);
                   resendBtn.parentNode.replaceChild(newResendBtn, resendBtn);
                   newResendBtn.addEventListener('click', async () => {
                       try {
                           await sendEmailVerification(auth.currentUser);
                           alert("Verification link resent!");
                       } catch (err) {
                           alert(err.message);
                       }
                   });
                   
                   // Start polling again
                   const checkVerification = setInterval(async () => {
                        await auth.currentUser.reload();
                        if (auth.currentUser.emailVerified) {
                            clearInterval(checkVerification);
                            
                            // Ensure profile exists in Firestore
                            const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
                            if (!docSnap.exists()) {
                                await setDoc(doc(db, 'users', auth.currentUser.uid), {
                                    email: auth.currentUser.email,
                                    createdAt: serverTimestamp()
                                });
                            }
                            window.location.href = 'onboarding.html';
                        }
                    }, 2000);
                }
            }
        } else {
            if (window.hideLoader) window.hideLoader(true);
        }
    });

    if (loginFormElement) {
        loginFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                // Change UI state if needed, e.g., button loading text
                const btn = loginFormElement.querySelector('button[type="submit"]');
                const origText = btn.textContent;
                btn.textContent = 'Logging in...';
                await signInWithEmailAndPassword(auth, email, password);
                // Will redirect automatically due to auth state listener
            } catch (error) {
                alert(error.message);
                loginFormElement.querySelector('button[type="submit"]').textContent = 'Log In';
            }
        });
    }

    if (signupFormElement) {
        signupFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const fullName = document.getElementById('full-name').value;

            if (password !== confirmPassword) {
                alert("Passwords don't match!");
                return;
            }

            try {
                const btn = signupFormElement.querySelector('button[type="submit"]');
                btn.textContent = 'Creating Account...';
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const { user } = userCredential;
                
                // Send Verification Email
                await sendEmailVerification(user);

                // Show Verification UI
                document.getElementById('signup-form').classList.remove('active');
                document.getElementById('verification-wait').style.display = 'block';

                // Setup Resend Button
                document.getElementById('resend-verification-btn').addEventListener('click', async () => {
                    try {
                        await sendEmailVerification(user);
                        alert("Verification link resent!");
                    } catch (err) {
                        alert(err.message);
                    }
                });

                // Polling for email verification
                const checkVerification = setInterval(async () => {
                    await auth.currentUser.reload();
                    if (auth.currentUser.emailVerified) {
                        clearInterval(checkVerification);
                        
                        // Save profile to Firestore
                        await setDoc(doc(db, 'users', auth.currentUser.uid), {
                            fullName,
                            email,
                            createdAt: serverTimestamp()
                        });
                        
                        window.location.href = 'onboarding.html';
                    }
                }, 2000); // Check every 2 seconds

            } catch (error) {
                alert(error.message);
                signupFormElement.querySelector('button[type="submit"]').textContent = 'Create Account';
            }
        });
    }

    const handleGoogleAuth = async (e) => {
        e.preventDefault();
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const { user } = result;
            // Save profile if it's new
            await setDoc(doc(db, 'users', user.uid), {
                fullName: user.displayName,
                email: user.email,
                lastLoginAt: serverTimestamp()
            }, { merge: true });
            
            // Explicitly redirect after Google Login succeeds
            const docSnap = await getDoc(doc(db, 'users', user.uid));
            if (docSnap.exists() && docSnap.data().onboardingComplete) {
                window.location.href = 'index.html';
            } else {
                window.location.href = 'onboarding.html';
            }
            
        } catch (error) {
            console.error("Popup failed:", error);
            // If the popup is blocked by Brave/Safari, we fallback to a full-page redirect
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request' || error.code === 'auth/web-storage-unsupported') {
                alert("Popup blocked by browser. Redirecting for sign-in...");
                signInWithRedirect(auth, googleProvider);
            } else {
                alert("Google Sign-In Failed: " + error.message);
            }
        }
    };

    if (googleLoginBtn) googleLoginBtn.addEventListener('click', handleGoogleAuth);
    if (googleSignupBtn) googleSignupBtn.addEventListener('click', handleGoogleAuth);
});
