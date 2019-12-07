import * as f from "./index";
import * as firestore from "@firebase/firestore-types";

const firestoreIns = {} as f.TypedFirebaseFirestore<{
  user: { doc: { name: string; age: number }; col: {} };
}>;

(async () => {
  const docRef = firestoreIns.collection("user").doc("faw");
  const userData = (await docRef.get()).data();
  if (userData === undefined) {
    return;
  }
  userData.age;
  firestoreIns.runTransaction(tra => tra.delete(docRef).get(docRef));
})();
