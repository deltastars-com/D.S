// ملف: firebase-messaging-sw.js (يوضع في الواجهة الأمامية للمتجر)
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

// يتم أخذ هذه البيانات من لوحة تحكم Firebase (Project Settings)
const firebaseConfig = {
  apiKey: "AIzaSyDq63A6ob2MfTudOfnZN94DQCNl3pi0bA0",
  authDomain: "gen-lang-client-0049556086.firebaseapp.com",
  projectId: "gen-lang-client-0049556086",
  storageBucket: "gen-lang-client-0049556086.firebasestorage.app",
  messagingSenderId: "906381862795",
  appId: "1:906381862795:web:ef22df39bcbdc6ccbfb18e"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// استقبال الإشعارات حتى وإن كان التطبيق مغلقاً (Offline/Background)
messaging.onBackgroundMessage((payload) => {
  console.log('رسالة سيادية جديدة:', payload);
  const notificationTitle = payload.notification.title || 'إشعار من نجوم دلتا';
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://deltastars.store/icon.png',
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
