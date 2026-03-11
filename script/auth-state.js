import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
    // Find nav actions container
    const navActions = document.querySelector('.nav-actions');

    // Create 'My Profile' Avatar Button
    const profileBtn = document.createElement('a');
    profileBtn.href = 'profile.html';
    profileBtn.className = 'user-avatar-nav';
    profileBtn.innerHTML = '<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0" alt="Avatar">';
    profileBtn.style.display = 'none';

    // Create 'Log Out' button
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'nav-logout-btn';
    logoutBtn.innerHTML = '<i class="ri-logout-box-r-line"></i> Logout';
    logoutBtn.style.display = 'none';

    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    });

    // Optional: Add a simple container for logged-in state buttons
    const loggedInActions = document.createElement('div');
    loggedInActions.style.display = 'flex';
    loggedInActions.style.gap = '1rem';
    loggedInActions.appendChild(logoutBtn);
    loggedInActions.appendChild(profileBtn);

    if (navActions) {
        navActions.appendChild(loggedInActions);

        const loginBtn = navActions.querySelector('a[href="login.html"]');
        const signupBtn = navActions.querySelector('a[href="signup.html"]');

        onAuthStateChanged(auth, async (user) => {
            // Treat unverified email users as logged out for the navbar UI
            const isVerifiedOrGoogle = user && (user.emailVerified || user.providerData.some(p => p.providerId === 'google.com'));
            
            if (isVerifiedOrGoogle) {
                // User is signed in
                if (loginBtn) loginBtn.style.display = 'none';
                if (signupBtn) signupBtn.style.display = 'none';
                profileBtn.style.display = 'inline-block';
                logoutBtn.style.display = 'inline-block';

                // Fetch avatarUrl
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists() && userDoc.data().avatarUrl) {
                        profileBtn.innerHTML = `<img src="${userDoc.data().avatarUrl}" alt="Avatar">`;
                    }
                } catch (e) { console.error("Could not fetch avatar:", e); }

            } else {
                // User is signed out
                if (loginBtn) loginBtn.style.display = 'inline-block';
                if (signupBtn) signupBtn.style.display = 'inline-block';
                profileBtn.style.display = 'none';
                logoutBtn.style.display = 'none';

                // Reset to default
                profileBtn.innerHTML = '<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0" alt="Avatar">';
            }

            if (document.body.dataset.waitForData !== 'true' && window.hideLoader) {
                window.hideLoader(true);
            }
        });
    }
});
