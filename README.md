# typed-firestore

[![npm version](https://badge.fury.io/js/typed-firestore.svg)](https://badge.fury.io/js/typed-firestore)
[![NPM](https://nodei.co/npm/typed-firestore.png)](https://nodei.co/npm/typed-firestore/)

type support for firebase firestore.

## client

```ts
import * as firebase from "firebase/app";
import "firebase/firestore";
import * as typedFirestore from "typed-firestore";

firebase.initializeApp({...});

const firestore = firebase.firestore() as typedFirestore.TypedFirebaseFirestore<{
  user: {
    doc: {
      name: string;
      age: number;
      openIdConnect: {
        providerName: string;
        idInProvider: string;
      };
      playlist: Array<string>;
      createdAt: firestore.Timestamp;
    };
    col: {};  // sub collection
  };
}>;

// Type hint !!!!!
const user = firestore.collection("user");

(async () => {
  const userQuerySnapshotArray = await firestoreIns
    .collection("user")
    .where("age", "<=", 20)
    .get();

  for (const userQueryDocumentSnapshot of userQuerySnapshotArray.docs) {
    // Type hint !!!!!
    console.log("name", userQueryDocumentSnapshot.data().name);
  }
})();
```

## admin (Does not fit all types)

```ts
import * as admin from "firebase-admin";
import * as typedFirestore from "typed-firestore";

const app = admin.initializeApp();
const firestore = app.firestore() as typedFirestore.TypedFirebaseFirestore<{
  user: {
    doc: {
      name: string;
      age: number;
      openIdConnect: {
        providerName: string;
        idInProvider: string;
      };
      playlist: Array<string>;
      createdAt: firestore.Timestamp;
    };
    col: {}; // sub collection
  };
}>;

// Type hint !!!!!
const user = firestore.collection("user");

(async () => {
  const userQuerySnapshotArray = await firestoreIns
    .collection("user")
    .where("age", "<=", 20)
    .get();

  for (const userQueryDocumentSnapshot of userQuerySnapshotArray.docs) {
    // Type hint !!!!!
    console.log("name", userQueryDocumentSnapshot.data().name);
  }
})();
```
