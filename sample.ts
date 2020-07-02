import type * as f from "./index";
import * as firestore from "@firebase/firestore-types";

const firestoreInstance = (({} as firestore.FirebaseFirestore) as unknown) as f.Firestore<{
  user: { key: UserId; value: User; subCollections: {} };
  music: { key: MusicId; value: Music; subCollections: {} };
  project: {
    key: ProjectId;
    value: Project;
    subCollections: {
      data:
        | {
            key: "Body";
            value: { text: string };
            subCollections: {};
          }
        | {
            key: "Comments";
            value: Comments;
            subCollections: {};
          };
    };
  };
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

type ProjectId = string & { _projectId: never };

type Project = {
  name: string;
  createdBy: UserId;
};

type Comments = {
  comments: ReadonlyArray<{
    body: string;
    createdBy: UserId;
    createdAt: firestore.Timestamp;
  }>;
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

  const commentDoc = await firestoreInstance
    .collection("project") // autocomplete
    .doc("6b9495528e9a12186b9c210448bdc90b" as ProjectId)
    .collection("data") // autocomplete
    .doc("Comments") // autocomplete
    .get(); // returns DocumentSnapshot of Comments
})();
