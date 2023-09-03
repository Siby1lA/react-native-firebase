import { Button, View } from "react-native";
import React, { useEffect, useState } from "react";
import {
  login,
  getProfile as getKakaoProfile,
} from "@react-native-seoul/kakao-login";
import { firebase } from "@react-native-firebase/functions";
import { authService, fireStore } from "./firebase";

const App = () => {
  const setStoreUserInfo = async (email: string, uid: string) => {
    const userData = {
      displayName: email.split("@")[0],
      email,
      uid,
    };

    // db에 유저 정보 저장
    await fireStore.collection("users").doc(`${uid}`).set(userData);
  };
  // 카카오 로그인
  const onKakaoButtonPress = async (): Promise<void> => {
    try {
      const token = await login();
      const profile = await getKakaoProfile();
      const userInfoData = JSON.parse(JSON.stringify(profile));
      const { email, id } = userInfoData;
      // 작성한 cloud 함수 호출
      const { data } = await firebase
        .functions()
        .httpsCallable("customTokenLogin")({
        email: "psb4644@gmail.com",
        id,
      });
      const { firebaseToken, newUser } = data;
      // 발급받은 커스텀 토큰으로 파이어베이스 로그인 시키기
      const signInWithCustomTokenResult =
        await authService.signInWithCustomToken(firebaseToken);
      if (newUser) {
        const kakaoEmail = `${"psb4644@gmail.com".split("@")[0]}@kakao.com`;
        setStoreUserInfo(kakaoEmail, signInWithCustomTokenResult.user.uid); // fireStore에 신규 유저 데이터 저장하는 함수
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View
      style={{ height: "100%", justifyContent: "center", alignItems: "center" }}
    >
      <Button title="카카오 로그인" onPress={() => onKakaoButtonPress()} />
    </View>
  );
};

export default App;
