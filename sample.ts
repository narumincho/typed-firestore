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
  const docRef = firestoreIns.collection("user").doc("faw");
  const userData = (await docRef.get()).data();
  if (userData === undefined) {
    return;
  }
  userData.age;
  userData.openIdConnect.idInProvider;
  firestoreIns
    .collection("user")
    .where(new firestore.FieldPath("age"), "==", 32);
})();
