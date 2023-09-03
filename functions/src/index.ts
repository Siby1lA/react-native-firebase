const functions = require("firebase-functions");
const admin = require("firebase-admin");

const getAdminApp = () => {
  const serviceAccountKey = JSON.parse(process.env.SERVICE_ACCOUNT_KEY || "");

  const adminApp = !admin.apps.length
    ? admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
      })
    : admin.app();

  return adminApp;
};

const getCustomToken = async (email: string, id: string) => {
  const adminApp = getAdminApp();
  const auth = admin.auth(adminApp);
  // 카카오 커스텀 로그인
  const kakaoEmail = `${email.split("@")[0]}@kakao.com`;
  const properties = {
    uid: `kakao:${id}`,
    provider: "KAKAO",
    displayName: email,
    email: kakaoEmail,
  };
  let authUser;
  let newUser = false;
  try {
    // 해당 유저 확인
    authUser = await auth.updateUser(properties.uid, properties);
  } catch (error) {
    // 유저가 없을 시 생성
    if (error.code === "auth/user-not-found") {
      authUser = await auth.createUser(properties);
      newUser = true;
    }
  }
  // 커스텀 토큰 발급
  const firebaseToken = await admin
    .auth()
    .createCustomToken(authUser.uid, { provider: "KAKAO" });
  return { firebaseToken, newUser };
};

exports.customTokenLogin = functions.https.onCall(async (data, context) => {
  const { email, id } = data;
  const customToken = await getCustomToken(email, id);
  return customToken;
});
