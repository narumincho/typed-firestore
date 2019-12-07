import * as f from "./index";
import * as firestore from "@firebase/firestore-types";

const firestoreIns = {} as f.TypedFirebaseFirestore<{
  user: { doc: { name: string; age: number }; col: {} };
}>;

(async () => {
  const userData = (
    await firestoreIns
      .collection("user")
      .doc("faw")
      .get()
  ).data();
  if (userData === undefined) {
    return;
  }
  userData.age;
  const r: f.R = ["user", "account", "service"];
})();
