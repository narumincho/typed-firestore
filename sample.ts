import * as f from "./index";
import * as firestore from "@firebase/firestore-types";

const firestoreIns = {} as f.TypedFirebaseFirestore<{
  user: { doc: User; col: {} };
}>;

type User = {
  name: string;
  age: number;
  openIdConnect: {
    providerName: string;
    idInProvider: string;
  };
  playlist: Array<string>;
  createdAt: firestore.Timestamp;
};

(async () => {
  const userQuerySnapshotArray = await firestoreIns
    .collection("user")
    .where("age", "<=", 20)
    .get();

  for (const userQueryDocumentSnapshot of userQuerySnapshotArray.docs) {
    console.log("name", userQueryDocumentSnapshot.data().name); // Type hint !!!!!
    console.log(
      "providerName",
      userQueryDocumentSnapshot.data().openIdConnect.providerName
    ); // Type hint !!!!!
  }
})();
