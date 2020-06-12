import type * as f from "./index";
import * as firestore from "@firebase/firestore-types";

const firestoreInstance = (({} as firestore.FirebaseFirestore) as unknown) as f.Firestore<{
  user: { key: UserId; value: User; subCollections: {} };
  music: { key: MusicId; value: Music; subCollections: {} };
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
