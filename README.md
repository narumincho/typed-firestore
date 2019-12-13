# typed-firestore

[![npm version](https://badge.fury.io/js/typed-firestore.svg)](https://badge.fury.io/js/typed-firestore)
[![NPM](https://nodei.co/npm/typed-firestore.png)](https://nodei.co/npm/typed-firestore/)

type support for firebase firestore.

[typed-admin-firestore](https://github.com/narumincho/typed-admin-firestore)

## client

```ts
import * as firebase from "firebase/app";
import "firebase/firestore";
import * as typedFirestore from "typed-firestore";

firebase.initializeApp({...});

const firestoreInstance = (firebase.firestore() as unknown) as f.Firestore<{
  user: { key: UserId; doc: User; col: {} };
  music: { key: MusicId; doc: Music; col: {} };
}>;

type UserId = string & { _userId: never };

type User = {
  name: string;
  age: number;
  openIdConnect: {
    providerName: string;
    idInProvider: string;
  };
  likedMusics: Array<MusicId>;
  createdAt: firestore.Timestamp;
};

type MusicId = string & { _musicId: never };

type Music = {
  title: string;
  artist: UserId;
};

(async () => {
  const userQuerySnapshotArray = await firestoreInstance
    .collection("user")
    .where("age", "<=", 20)
    .get();

  for (const userQueryDocumentSnapshot of userQuerySnapshotArray.docs) {
    const data = userQueryDocumentSnapshot.data();
    console.log("name", data.name); // Type hint !!!!!
    console.log("providerName", data.openIdConnect.providerName); // Type hint !!!!!

    for (const likedMusicId of data.likedMusics) {
      firestoreInstance.collection("music").doc(likedMusicId); // no error !!!
      firestoreInstance.collection("user").doc(likedMusicId); // error !!!
    }
  }
})();
```
