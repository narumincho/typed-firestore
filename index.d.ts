/**
 * @license
 * 2019 narumincho
 *
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as firebaseApp from "@firebase/app-types";
import * as firestore from "@firebase/firestore-types";

type ValueOf<T> = T[keyof T];

type ObjectValueType<T extends DocumentData> = ValueOf<
  {
    [k0 in keyof T]:
      | T[k0]
      | (T[k0] extends DocumentData ? ObjectValueType<T[k0]> : never);
  }
>;

/**
 * Document data (for use with `DocumentReference.set()`) consists of fields
 * mapped to values.
 */
type DocumentData = {
  [field in string]:
    | FirestorePrimitiveType
    | Array<FirestorePrimitiveType>
    | ReadonlyArray<FirestorePrimitiveType>;
};

type CollectionsData = {
  [key in string]: DocumentAndSubCollectionData;
};

type DocumentAndSubCollectionData = {
  key: string;
  value: DocumentData;
  subCollections: CollectionsData;
};

type GetIncludeDocument<col extends CollectionsData> = ValueOf<
  {
    [key in keyof col]:
      | col[key]["value"]
      | GetIncludeDocument<col[key]["subCollections"]>;
  }
>;

type FirestorePrimitiveType =
  | boolean
  | firestore.Blob
  | firestore.Timestamp
  | number
  | firestore.GeoPoint
  | {
      [field in string]:
        | FirestorePrimitiveType
        | Array<FirestorePrimitiveType>
        | ReadonlyArray<FirestorePrimitiveType>;
    }
  | null
  | firestore.CollectionReference
  | firestore.DocumentReference
  | string;

/**
 * Update data (for use with `DocumentReference.update()`) consists of field
 * paths (e.g. 'foo' or 'foo.baz') mapped to values. Fields that contain dots
 * reference nested fields within the document.
 */

type UpdateData<doc extends DocumentData> = Partial<
  { [key in keyof doc]: doc[key] | firestore.FieldValue }
>;

type SetData<doc extends DocumentData> = {
  [key in keyof doc]: doc[key] | firestore.FieldValue;
};

type SetDataMargeTrue<doc extends DocumentData> = Partial<
  {
    [key in keyof doc]:
      | (doc[key] extends DocumentData ? SetDataMargeTrue<doc[key]> : doc[key])
      | firestore.FieldValue;
  }
>;

type Firestore<col extends CollectionsData> = {
  /**
   * Specifies custom settings to be used to configure the `Firestore`
   * instance. Must be set before invoking any other methods.
   *
   * @param settings The settings to use.
   */
  readonly settings: (settings: firestore.Settings) => void;

  /**
   * Attempts to enable persistent storage, if possible.
   *
   * Must be called before any other methods (other than settings() and
   * clearPersistence()).
   *
   * If this fails, enablePersistence() will reject the promise it returns.
   * Note that even after this failure, the firestore instance will remain
   * usable, however offline persistence will be disabled.
   *
   * There are several reasons why this can fail, which can be identified by
   * the `code` on the error.
   *
   *   * failed-precondition: The app is already open in another browser tab.
   *   * unimplemented: The browser is incompatible with the offline
   *     persistence implementation.
   *
   * @param settings Optional settings object to configure persistence.
   * @return A promise that represents successfully enabling persistent
   * storage.
   */
  readonly enablePersistence: (
    settings?: firestore.PersistenceSettings
  ) => Promise<void>;

  /**
   * Gets a `CollectionReference` instance that refers to the collection at
   * the specified path.
   *
   * @param collectionPath A slash-separated path to a collection.
   * @return The `CollectionReference` instance.
   */
  readonly collection: <collectionPath extends keyof col>(
    collectionPath: collectionPath
  ) => CollectionReference<col[collectionPath]>;

  /**
   * Gets a `DocumentReference` instance that refers to the document at the
   * specified path.
   *
   * @param documentPath A slash-separated path to a document.
   * @return The `DocumentReference` instance.
   */
  readonly doc: <documentPath extends keyof col>(
    documentPath: documentPath
  ) => DocumentReference<col[documentPath]>;

  /**
   * Creates and returns a new Query that includes all documents in the
   * database that are contained in a collection or subcollection with the
   * given collectionId.
   *
   * @param collectionId Identifies the collections to query over. Every
   * collection or subcollection with this ID as the last segment of its path
   * will be included. Cannot contain a slash.
   * @return The created Query.
   */
  readonly collectionGroup: <key extends string, value extends DocumentData>(
    collectionId: string
  ) => Query<key, value>;

  /**
   * Executes the given `updateFunction` and then attempts to commit the changes
   * applied within the transaction. If any document read within the transaction
   * has changed, Cloud Firestore retries the `updateFunction`. If it fails to
   * commit after 5 attempts, the transaction fails.
   *
   * The maximum number of writes allowed in a single transaction is 500, but
   * note that each usage of `FieldValue.serverTimestamp()`,
   * `FieldValue.arrayUnion()`, `FieldValue.arrayRemove()`, or
   * `FieldValue.increment()` inside a transaction counts as an additional write.
   *
   * @param updateFunction
   *   The function to execute within the transaction context.
   *
   * @return
   *   If the transaction completed successfully or was explicitly aborted
   *   (the `updateFunction` returned a failed promise),
   *   the promise returned by the updateFunction is returned here. Else, if the
   *   transaction failed, a rejected promise with the corresponding failure
   *   error will be returned.
   */
  readonly runTransaction: <T>(
    updateFunction: (transaction: Transaction) => Promise<T>
  ) => Promise<T>;

  /**
   * Creates a write batch, used for performing multiple writes as a single
   * atomic operation. The maximum number of writes allowed in a single WriteBatch
   * is 500, but note that each usage of `FieldValue.serverTimestamp()`,
   * `FieldValue.arrayUnion()`, `FieldValue.arrayRemove()`, or
   * `FieldValue.increment()` inside a WriteBatch counts as an additional write.
   *
   * @return
   *   A `WriteBatch` that can be used to atomically execute multiple writes.
   */
  readonly batch: () => WriteBatch;

  /**
   * The {@link firebase.app.App app} associated with this `Firestore` service
   * instance.
   */
  readonly app: firebaseApp.FirebaseApp;

  /**
   * Clears the persistent storage. This includes pending writes and cached
   * documents.
   *
   * Must be called while the firestore instance is not started (after the app
   * is shutdown or when the app is first initialized). On startup, this
   * method must be called before other methods (other than settings()). If
   * the firestore instance is still running, the promise will be rejected
   * with the error code of `failed-precondition`.
   *
   * Note: clearPersistence() is primarily intended to help write reliable
   * tests that use Cloud Firestore. It uses an efficient mechanism for
   * dropping existing data but does not attempt to securely overwrite or
   * otherwise make cached data unrecoverable. For applications that are
   * sensitive to the disclosure of cached data in between user sessions, we
   * strongly recommend not enabling persistence at all.
   *
   * @return A promise that is resolved when the persistent storage is
   * cleared. Otherwise, the promise is rejected with an error.
   */
  readonly clearPersistence: () => Promise<void>;

  /**
   * Re-enables use of the network for this Firestore instance after a prior
   * call to {@link firebase.firestore.Firestore.disableNetwork
   * `disableNetwork()`}.
   *
   * @return A promise that is resolved once the network has been
   *   enabled.
   */
  readonly enableNetwork: () => Promise<void>;

  /**
   * Disables network usage for this instance. It can be re-enabled via
   * {@link firebase.firestore.Firestore.enableNetwork `enableNetwork()`}. While
   * the network is disabled, any snapshot listeners or get() calls will return
   * results from cache, and any write operations will be queued until the network
   * is restored.
   *
   * @return A promise that is resolved once the network has been
   *   disabled.
   */
  readonly disableNetwork: () => Promise<void>;

  /**
   * Waits until all currently pending writes for the active user have been acknowledged by the
   * backend.
   *
   * The returned Promise resolves immediately if there are no outstanding writes. Otherwise, the
   * Promise waits for all previously issued writes (including those written in a previous app
   * session), but it does not wait for writes that were added after the method is called. If you
   * want to wait for additional writes, call `waitForPendingWrites()` again.
   *
   * Any outstanding `waitForPendingWrites()` Promises are rejected during user changes.
   *
   * @return A Promise which resolves when all currently pending writes have been
   * acknowledged by the backend.
   */
  readonly waitForPendingWrites: () => Promise<void>;

  /**
   * Attaches a listener for a snapshots-in-sync event. The snapshots-in-sync
   * event indicates that all listeners affected by a given change have fired,
   * even if a single server-generated change affects multiple listeners.
   *
   * NOTE: The snapshots-in-sync event only indicates that listeners are in sync
   * with each other, but does not relate to whether those snapshots are in sync
   * with the server. Use SnapshotMetadata in the individual listeners to
   * determine if a snapshot is from the cache or the server.
   *
   * @param observer A single object containing `next` and `error` callbacks.
   * @return An unsubscribe function that can be called to cancel the snapshot
   * listener.
   */
  onSnapshotsInSync(observer: {
    next?: (value: void) => void;
    error?: (error: Error) => void;
    complete?: () => void;
  }): () => void;

  /**
   * Attaches a listener for a snapshots-in-sync event. The snapshots-in-sync
   * event indicates that all listeners affected by a given change have fired,
   * even if a single server-generated change affects multiple listeners.
   *
   * NOTE: The snapshots-in-sync event only indicates that listeners are in sync
   * with each other, but does not relate to whether those snapshots are in sync
   * with the server. Use SnapshotMetadata in the individual listeners to
   * determine if a snapshot is from the cache or the server.
   *
   * @param onSync A callback to be called every time all snapshot listeners are
   * in sync with each other.
   * @return An unsubscribe function that can be called to cancel the snapshot
   * listener.
   */
  onSnapshotsInSync(onSync: () => void): () => void;

  /**
   * Terminates this Firestore instance.
   *
   * After calling `terminate()` only the `clearPersistence()` method may be used. Any other method
   * will throw a `FirestoreError`.
   *
   * To restart after termination, create a new instance of FirebaseFirestore with
   * `firebase.firestore()`.
   *
   * Termination does not cancel any pending writes, and any promises that are awaiting a response
   * from the server will not be resolved. If you have persistence enabled, the next time you
   * start this instance, it will resume sending these writes to the server.
   *
   * Note: Under normal circumstances, calling `terminate()` is not required. This
   * method is useful only when you want to force this instance to release all of its resources or
   * in combination with `clearPersistence()` to ensure that all local state is destroyed
   * between test runs.
   *
   * @return A promise that is resolved when the instance has been successfully terminated.
   */
  readonly terminate: () => Promise<void>;
};

/**
 * A reference to a transaction.
 * The `Transaction` object passed to a transaction's updateFunction provides
 * the methods to read and write data within the transaction context. See
 * `Firestore.runTransaction()`.
 */
type Transaction = {
  /**
   * Reads the document referenced by the provided `DocumentReference.`
   *
   * @param documentRef A reference to the document to be read.
   * @return A DocumentSnapshot for the read data.
   */
  readonly get: <docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>
  ) => Promise<DocumentSnapshot<docAndSub["key"], docAndSub["value"]>>;

  /**
   * Writes to the document referred to by the provided `DocumentReference`.
   * If the document does not exist yet, it will be created. If you pass
   * `SetOptions`, the provided data can be merged into the existing document.
   *
   * @param documentRef A reference to the document to be set.
   * @param data An object of the fields and values for the document.
   * @param options An object to configure the set behavior.
   * @return This `Transaction` instance. Used for chaining method calls.
   */
  set<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>,
    data: SetDataMargeTrue<docAndSub["value"]>,
    options: { merge: true }
  ): Transaction;

  set<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>,
    data: SetData<docAndSub["value"]>,
    options?: firestore.SetOptions
  ): Transaction;
  /**
   * Updates fields in the document referred to by the provided
   * `DocumentReference`. The update will fail if applied to a document that
   * does not exist.
   *
   * @param documentRef A reference to the document to be updated.
   * @param data An object containing the fields and values with which to
   * update the document. Fields can contain dots to reference nested fields
   * within the document.
   * @return This `Transaction` instance. Used for chaining method calls.
   */
  update<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>,
    data: UpdateData<docAndSub["value"]>
  ): Transaction;

  /**
   * Updates fields in the document referred to by the provided
   * `DocumentReference`. The update will fail if applied to a document that
   * does not exist.
   *
   * Nested fields can be updated by providing dot-separated field path
   * strings or by providing FieldPath objects.
   *
   * @param documentRef A reference to the document to be updated.
   * @param field The first field to update.
   * @param value The first value.
   * @param moreFieldsAndValues Additional key/value pairs.
   * @return A Promise resolved once the data has been successfully written
   * to the backend (Note that it won't resolve while you're offline).
   */
  update<
    docAndSub extends DocumentAndSubCollectionData,
    path extends keyof docAndSub["value"] & string
  >(
    documentRef: DocumentReference<docAndSub>,
    field: path,
    value: docAndSub["value"][path],
    ...moreFieldsAndValues: any[]
  ): Transaction;

  update<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>,
    field: firestore.FieldPath,
    value: ObjectValueType<docAndSub["value"]>,
    ...moreFieldsAndValues: any[]
  ): Transaction;

  /**
   * Deletes the document referred to by the provided `DocumentReference`.
   *
   * @param documentRef A reference to the document to be deleted.
   * @return This `Transaction` instance. Used for chaining method calls.
   */
  readonly delete: (documentRef: firestore.DocumentReference) => Transaction;
};

/**
 * A write batch, used to perform multiple writes as a single atomic unit.
 *
 * A `WriteBatch` object can be acquired by calling `Firestore.batch()`. It
 * provides methods for adding writes to the write batch. None of the
 * writes will be committed (or visible locally) until `WriteBatch.commit()`
 * is called.
 *
 * Unlike transactions, write batches are persisted offline and therefore are
 * preferable when you don't need to condition your writes on read data.
 */
type WriteBatch = {
  /**
   * Writes to the document referred to by the provided `DocumentReference`.
   * If the document does not exist yet, it will be created. If you pass
   * `SetOptions`, the provided data can be merged into the existing document.
   *
   * @param documentRef A reference to the document to be set.
   * @param data An object of the fields and values for the document.
   * @param options An object to configure the set behavior.
   * @return This `WriteBatch` instance. Used for chaining method calls.
   */
  set<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>,
    data: SetDataMargeTrue<docAndSub["value"]>,
    options: { merge: true }
  ): WriteBatch;

  set<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>,
    data: SetData<docAndSub["value"]>,
    options?: firestore.SetOptions
  ): WriteBatch;

  /**
   * Updates fields in the document referred to by the provided
   * `DocumentReference`. The update will fail if applied to a document that
   * does not exist.
   *
   * @param documentRef A reference to the document to be updated.
   * @param data An object containing the fields and values with which to
   * update the document. Fields can contain dots to reference nested fields
   * within the document.
   * @return This `WriteBatch` instance. Used for chaining method calls.
   */
  update<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>,
    data: UpdateData<docAndSub["value"]>
  ): WriteBatch;

  /**
   * Updates fields in the document referred to by this `DocumentReference`.
   * The update will fail if applied to a document that does not exist.
   *
   * Nested fields can be update by providing dot-separated field path strings
   * or by providing FieldPath objects.
   *
   * @param documentRef A reference to the document to be updated.
   * @param field The first field to update.
   * @param value The first value.
   * @param moreFieldsAndValues Additional key value pairs.
   * @return A Promise resolved once the data has been successfully written
   * to the backend (Note that it won't resolve while you're offline).
   */
  update<
    docAndSub extends DocumentAndSubCollectionData,
    path extends keyof docAndSub["value"] & string
  >(
    documentRef: DocumentReference<docAndSub>,
    field: path,
    value: docAndSub["value"][path],
    ...moreFieldsAndValues: any[]
  ): WriteBatch;

  update<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>,
    field: firestore.FieldPath,
    value: ObjectValueType<docAndSub["value"]>,
    ...moreFieldsAndValues: any[]
  ): WriteBatch;

  /**
   * Deletes the document referred to by the provided `DocumentReference`.
   *
   * @param documentRef A reference to the document to be deleted.
   * @return This `WriteBatch` instance. Used for chaining method calls.
   */
  readonly delete: (documentRef: firestore.DocumentReference) => WriteBatch;

  /**
   * Commits all of the writes in this write batch as a single atomic unit.
   *
   * @return A Promise resolved once all of the writes in the batch have been
   * successfully written to the backend as an atomic unit. Note that it won't
   * resolve while you're offline.
   */
  readonly commit: () => Promise<void>;
};

/**
 * A `DocumentReference` refers to a document location in a Firestore database
 * and can be used to write, read, or listen to the location. The document at
 * the referenced location may or may not exist. A `DocumentReference` can
 * also be used to create a `CollectionReference` to a subcollection.
 */
type DocumentReference<docAndSub extends DocumentAndSubCollectionData> = {
  /**
   * The document's identifier within its collection.
   */
  readonly id: docAndSub["key"];

  /**
   * The {@link firebase.firestore.Firestore} the document is in.
   * This is useful for performing transactions, for example.
   */
  readonly firestore: Firestore<any>;

  /**
   * The Collection this `DocumentReference` belongs to.
   */
  readonly parent: CollectionReference<docAndSub>;

  /**
   * A string representing the path of the referenced document (relative
   * to the root of the database).
   */
  readonly path: string;

  /**
   * Gets a `CollectionReference` instance that refers to the collection at
   * the specified path.
   *
   * @param collectionPath A slash-separated path to a collection.
   * @return The `CollectionReference` instance.
   */
  readonly collection: <
    collectionPath extends keyof docAndSub["subCollections"]
  >(
    collectionPath: collectionPath
  ) => CollectionReference<docAndSub["subCollections"][collectionPath]>;

  /**
   * Returns true if this `DocumentReference` is equal to the provided one.
   *
   * @param other The `DocumentReference` to compare against.
   * @return true if this `DocumentReference` is equal to the provided one.
   */
  readonly isEqual: (other: DocumentReference<docAndSub>) => boolean;

  /**
   * Writes to the document referred to by this `DocumentReference`. If the
   * document does not yet exist, it will be created. If you pass
   * `SetOptions`, the provided data can be merged into an existing document.
   *
   * @param data A map of the fields and values for the document.
   * @param options An object to configure the set behavior.
   * @return A Promise resolved once the data has been successfully written
   * to the backend (Note that it won't resolve while you're offline).
   */
  set(
    data: SetDataMargeTrue<docAndSub["value"]>,
    options: { merge: true }
  ): Promise<void>;

  set(
    data: SetData<docAndSub["value"]>,
    options?: firestore.SetOptions
  ): Promise<void>;
  /**
   * Updates fields in the document referred to by this `DocumentReference`.
   * The update will fail if applied to a document that does not exist.
   *
   * @param data An object containing the fields and values with which to
   * update the document. Fields can contain dots to reference nested fields
   * within the document.
   * @return A Promise resolved once the data has been successfully written
   * to the backend (Note that it won't resolve while you're offline).
   */
  update(data: UpdateData<docAndSub["value"]>): Promise<void>;

  /**
   * Updates fields in the document referred to by this `DocumentReference`.
   * The update will fail if applied to a document that does not exist.
   *
   * Nested fields can be updated by providing dot-separated field path
   * strings or by providing FieldPath objects.
   *
   * @param field The first field to update.
   * @param value The first value.
   * @param moreFieldsAndValues Additional key value pairs.
   * @return A Promise resolved once the data has been successfully written
   * to the backend (Note that it won't resolve while you're offline).
   */
  update<path extends keyof docAndSub["value"] & string>(
    field: path,
    value: docAndSub["value"][path],
    ...moreFieldsAndValues: any[]
  ): Promise<void>;

  update(
    field: firestore.FieldPath,
    value: ObjectValueType<docAndSub["value"]>,
    ...moreFieldsAndValues: any[]
  ): Promise<void>;

  /**
   * Deletes the document referred to by this `DocumentReference`.
   *
   * @return A Promise resolved once the document has been successfully
   * deleted from the backend (Note that it won't resolve while you're
   * offline).
   */
  readonly delete: () => Promise<void>;

  /**
   * Reads the document referred to by this `DocumentReference`.
   *
   * Note: By default, get() attempts to provide up-to-date data when possible
   * by waiting for data from the server, but it may return cached data or fail
   * if you are offline and the server cannot be reached. This behavior can be
   * altered via the `GetOptions` parameter.
   *
   * @param options An object to configure the get behavior.
   * @return A Promise resolved with a DocumentSnapshot containing the
   * current document contents.
   */
  readonly get: <T extends docAndSub["key"]>(
    options?: firestore.GetOptions
  ) => Promise<DocumentSnapshot<T, Extract<docAndSub, { key: T }>["value"]>>;

  /**
   * Attaches a listener for DocumentSnapshot events. You may either pass
   * individual `onNext` and `onError` callbacks or pass a single observer
   * object with `next` and `error` callbacks.
   *
   * NOTE: Although an `onCompletion` callback can be provided, it will
   * never be called because the snapshot stream is never-ending.
   *
   * @param observer A single object containing `next` and `error` callbacks.
   * @return An unsubscribe function that can be called to cancel
   * the snapshot listener.
   */
  onSnapshot(observer: {
    next?: (
      snapshot: DocumentSnapshot<docAndSub["key"], docAndSub["value"]>
    ) => void;
    error?: (error: firestore.FirestoreError) => void;
    complete?: () => void;
  }): () => void;

  /**
   * Attaches a listener for DocumentSnapshot events. You may either pass
   * individual `onNext` and `onError` callbacks or pass a single observer
   * object with `next` and `error` callbacks.
   *
   * NOTE: Although an `onCompletion` callback can be provided, it will
   * never be called because the snapshot stream is never-ending.
   *
   * @param options Options controlling the listen behavior.
   * @param observer A single object containing `next` and `error` callbacks.
   * @return An unsubscribe function that can be called to cancel
   * the snapshot listener.
   */
  onSnapshot(
    options: firestore.SnapshotListenOptions,
    observer: {
      next?: (
        snapshot: DocumentSnapshot<docAndSub["key"], docAndSub["value"]>
      ) => void;
      error?: (error: Error) => void;
      complete?: () => void;
    }
  ): () => void;

  /**
   * Attaches a listener for DocumentSnapshot events. You may either pass
   * individual `onNext` and `onError` callbacks or pass a single observer
   * object with `next` and `error` callbacks.
   *
   * NOTE: Although an `onCompletion` callback can be provided, it will
   * never be called because the snapshot stream is never-ending.
   *
   * @param onNext A callback to be called every time a new `DocumentSnapshot`
   * is available.
   * @param onError A callback to be called if the listen fails or is
   * cancelled. No further callbacks will occur.
   * @return An unsubscribe function that can be called to cancel
   * the snapshot listener.
   */
  onSnapshot(
    onNext: (
      snapshot: DocumentSnapshot<docAndSub["key"], docAndSub["value"]>
    ) => void,
    onError?: (error: Error) => void,
    onCompletion?: () => void
  ): () => void;

  /**
   * Attaches a listener for DocumentSnapshot events. You may either pass
   * individual `onNext` and `onError` callbacks or pass a single observer
   * object with `next` and `error` callbacks.
   *
   * NOTE: Although an `onCompletion` callback can be provided, it will
   * never be called because the snapshot stream is never-ending.
   *
   * @param options Options controlling the listen behavior.
   * @param onNext A callback to be called every time a new `DocumentSnapshot`
   * is available.
   * @param onError A callback to be called if the listen fails or is
   * cancelled. No further callbacks will occur.
   * @return An unsubscribe function that can be called to cancel
   * the snapshot listener.
   */
  onSnapshot(
    options: firestore.SnapshotListenOptions,
    onNext: (
      snapshot: DocumentSnapshot<docAndSub["key"], docAndSub["value"]>
    ) => void,
    onError?: (error: Error) => void,
    onCompletion?: () => void
  ): () => void;
};

/**
 * A `DocumentSnapshot` contains data read from a document in your Firestore
 * database. The data can be extracted with `.data()` or `.get(<field>)` to
 * get a specific field.
 *
 * For a `DocumentSnapshot` that points to a non-existing document, any data
 * access will return 'undefined'. You can use the `exists` property to
 * explicitly verify a document's existence.
 */
type DocumentSnapshot<key extends string, doc extends DocumentData> = {
  /**
   * Property of the `DocumentSnapshot` that signals whether or not the data
   * exists. True if the document exists.
   */
  readonly exists: boolean;

  /**
   * The `DocumentReference` for the document included in the `DocumentSnapshot`.
   */
  readonly ref: DocumentReference<{
    key: string;
    value: doc;
    subCollections: any;
  }>;

  /**
   * Property of the `DocumentSnapshot` that provides the document's ID.
   */
  readonly id: key;

  /**
   *  Metadata about the `DocumentSnapshot`, including information about its
   *  source and local modifications.
   */
  readonly metadata: firestore.SnapshotMetadata;

  /**
   * Retrieves all fields in the document as an Object. Returns 'undefined' if
   * the document doesn't exist.
   *
   * By default, `FieldValue.serverTimestamp()` values that have not yet been
   * set to their final value will be returned as `null`. You can override
   * this by passing an options object.
   *
   * @param options An options object to configure how data is retrieved from
   * the snapshot (e.g. the desired behavior for server timestamps that have
   * not yet been set to their final value).
   * @return An Object containing all fields in the document or 'undefined' if
   * the document doesn't exist.
   */
  readonly data: (options?: firestore.SnapshotOptions) => doc | undefined;

  /**
   * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
   * document or field doesn't exist.
   *
   * By default, a `FieldValue.serverTimestamp()` that has not yet been set to
   * its final value will be returned as `null`. You can override this by
   * passing an options object.
   *
   * @param fieldPath The path (e.g. 'foo' or 'foo.bar') to a specific field.
   * @param options An options object to configure how the field is retrieved
   * from the snapshot (e.g. the desired behavior for server timestamps that have
   * not yet been set to their final value).
   * @return The data at the specified field location or undefined if no such
   * field exists in the document.
   */
  get<path extends keyof doc & string>(
    fieldPath: path,
    options?: firestore.SnapshotOptions
  ): doc[path] | undefined;
  get(
    fieldPath: firestore.FieldPath,
    options?: firestore.SnapshotOptions
  ): ObjectValueType<doc> | undefined;

  /**
   * Returns true if this `DocumentSnapshot` is equal to the provided one.
   *
   * @param other The `DocumentSnapshot` to compare against.
   * @return true if this `DocumentSnapshot` is equal to the provided one.
   */
  readonly isEqual: (other: DocumentSnapshot<key, doc>) => boolean;
};

/**
 * A `QueryDocumentSnapshot` contains data read from a document in your
 * Firestore database as part of a query. The document is guaranteed to exist
 * and its data can be extracted with `.data()` or `.get(<field>)` to get a
 * specific field.
 *
 * A `QueryDocumentSnapshot` offers the same API surface as a
 * `DocumentSnapshot`. Since query results contain only existing documents, the
 * `exists` property will always be true and `data()` will never return
 * 'undefined'.
 */
interface QueryDocumentSnapshot<key extends string, doc extends DocumentData>
  extends DocumentSnapshot<key, doc> {
  /**
   * Retrieves all fields in the document as an Object.
   *
   * By default, `FieldValue.serverTimestamp()` values that have not yet been
   * set to their final value will be returned as `null`. You can override
   * this by passing an options object.
   *
   * @override
   * @param options An options object to configure how data is retrieved from
   * the snapshot (e.g. the desired behavior for server timestamps that have
   * not yet been set to their final value).
   * @return An Object containing all fields in the document.
   */
  readonly data: (options?: firestore.SnapshotOptions) => doc;
}

/**
 * A `Query` refers to a Query which you can read or listen to. You can also
 * construct refined `Query` objects by adding filters and ordering.
 */
type Query<key extends string, value extends DocumentData> = {
  /**
   * The `Firestore` for the Firestore database (useful for performing
   * transactions, etc.).
   */
  readonly firestore: Firestore<any>;

  /**
   * Creates and returns a new Query with the additional filter that documents
   * must contain the specified field and the value should satisfy the
   * relation constraint provided.
   *
   * @param fieldPath The path to compare
   * @param opStr The operation string (e.g "<", "<=", "==", ">", ">=").
   * @param value The value for comparison
   * @return The created Query.
   */
  where<path extends keyof value & string>(
    fieldPath: path,
    opStr: "<" | "<=" | "==" | ">=" | ">",
    value: value[path]
  ): Query<key, value>;

  where<path extends keyof value & string>(
    fieldPath: path,
    opStr: "array-contains",
    value: value[path] extends Array<infer V> ? V : never
  ): Query<key, value>;

  where<path extends keyof value & string>(
    fieldPath: path,
    opStr: "in",
    value: Array<value[path]>
  ): Query<key, value>;

  where<path extends keyof value & string>(
    fieldPath: path,
    opStr: "array-contains-any",
    value: value[path] extends Array<infer V> ? Array<V> : never
  ): Query<key, value>;

  where(
    fieldPath: firestore.FieldPath,
    opStr: firestore.WhereFilterOp,
    value: ObjectValueType<value>
  ): Query<key, value>;

  /**
   * Creates and returns a new Query that's additionally sorted by the
   * specified field, optionally in descending order instead of ascending.
   *
   * @param fieldPath The field to sort by.
   * @param directionStr Optional direction to sort by (`asc` or `desc`). If
   * not specified, order will be ascending.
   * @return The created Query.
   */
  orderBy<path extends keyof value & string>(
    fieldPath: path,
    directionStr?: firestore.OrderByDirection
  ): Query<key, value>;

  orderBy(
    fieldPath: firestore.FieldPath,
    directionStr?: firestore.OrderByDirection
  ): Query<key, value>;

  /**
   * Creates and returns a new Query that only returns the first matching
   * documents.
   *
   * @param limit The maximum number of items to return.
   * @return The created Query.
   */
  readonly limit: (limit: number) => Query<key, value>;

  /**
   * Creates and returns a new Query that only returns the last matching
   * documents.
   *
   * You must specify at least one `orderBy` clause for `limitToLast` queries,
   * otherwise an exception will be thrown during execution.
   *
   * @param limit The maximum number of items to return.
   * @return The created Query.
   */
  readonly limitToLast: (limit: number) => Query<key, value>;

  /**
   * Creates and returns a new Query that starts at the provided document
   * (inclusive). The starting position is relative to the order of the query.
   * The document must contain all of the fields provided in the `orderBy` of
   * this query.
   *
   * @param snapshot The snapshot of the document to start at.
   * @return The created Query.
   */
  startAt(snapshot: DocumentSnapshot<key, value>): Query<key, value>;

  /**
   * Creates and returns a new Query that starts at the provided fields
   * relative to the order of the query. The order of the field values
   * must match the order of the order by clauses of the query.
   *
   * @param fieldValues The field values to start this query at, in order
   * of the query's order by.
   * @return The created Query.
   */
  startAt(...fieldValues: any[]): Query<key, value>;

  /**
   * Creates and returns a new Query that starts after the provided document
   * (exclusive). The starting position is relative to the order of the query.
   * The document must contain all of the fields provided in the orderBy of
   * this query.
   *
   * @param snapshot The snapshot of the document to start after.
   * @return The created Query.
   */
  startAfter(snapshot: DocumentSnapshot<key, value>): Query<key, value>;

  /**
   * Creates and returns a new Query that starts after the provided fields
   * relative to the order of the query. The order of the field values
   * must match the order of the order by clauses of the query.
   *
   * @param fieldValues The field values to start this query after, in order
   * of the query's order by.
   * @return The created Query.
   */
  startAfter(...fieldValues: any[]): Query<key, value>;

  /**
   * Creates and returns a new Query that ends before the provided document
   * (exclusive). The end position is relative to the order of the query. The
   * document must contain all of the fields provided in the orderBy of this
   * query.
   *
   * @param snapshot The snapshot of the document to end before.
   * @return The created Query.
   */
  endBefore(snapshot: DocumentSnapshot<key, value>): Query<key, value>;

  /**
   * Creates and returns a new Query that ends before the provided fields
   * relative to the order of the query. The order of the field values
   * must match the order of the order by clauses of the query.
   *
   * @param fieldValues The field values to end this query before, in order
   * of the query's order by.
   * @return The created Query.
   */
  endBefore(...fieldValues: any[]): Query<key, value>;

  /**
   * Creates and returns a new Query that ends at the provided document
   * (inclusive). The end position is relative to the order of the query. The
   * document must contain all of the fields provided in the orderBy of this
   * query.
   *
   * @param snapshot The snapshot of the document to end at.
   * @return The created Query.
   */
  endAt(snapshot: DocumentSnapshot<key, value>): Query<key, value>;

  /**
   * Creates and returns a new Query that ends at the provided fields
   * relative to the order of the query. The order of the field values
   * must match the order of the order by clauses of the query.
   *
   * @param fieldValues The field values to end this query at, in order
   * of the query's order by.
   * @return The created Query.
   */
  endAt(...fieldValues: any[]): Query<key, value>;

  /**
   * Returns true if this `Query` is equal to the provided one.
   *
   * @param other The `Query` to compare against.
   * @return true if this `Query` is equal to the provided one.
   */
  readonly isEqual: (other: Query<key, value>) => boolean;

  /**
   * Executes the query and returns the results as a `QuerySnapshot`.
   *
   * Note: By default, get() attempts to provide up-to-date data when possible
   * by waiting for data from the server, but it may return cached data or fail
   * if you are offline and the server cannot be reached. This behavior can be
   * altered via the `GetOptions` parameter.
   *
   * @param options An object to configure the get behavior.
   * @return A Promise that will be resolved with the results of the Query.
   */
  readonly get: (
    options?: firestore.GetOptions
  ) => Promise<QuerySnapshot<key, value>>;

  /**
   * Attaches a listener for QuerySnapshot events. You may either pass
   * individual `onNext` and `onError` callbacks or pass a single observer
   * object with `next` and `error` callbacks. The listener can be cancelled by
   * calling the function that is returned when `onSnapshot` is called.
   *
   * NOTE: Although an `onCompletion` callback can be provided, it will
   * never be called because the snapshot stream is never-ending.
   *
   * @param observer A single object containing `next` and `error` callbacks.
   * @return An unsubscribe function that can be called to cancel
   * the snapshot listener.
   */
  onSnapshot(observer: {
    next?: (snapshot: QuerySnapshot<key, value>) => void;
    error?: (error: Error) => void;
    complete?: () => void;
  }): () => void;

  /**
   * Attaches a listener for QuerySnapshot events. You may either pass
   * individual `onNext` and `onError` callbacks or pass a single observer
   * object with `next` and `error` callbacks. The listener can be cancelled by
   * calling the function that is returned when `onSnapshot` is called.
   *
   * NOTE: Although an `onCompletion` callback can be provided, it will
   * never be called because the snapshot stream is never-ending.
   *
   * @param options Options controlling the listen behavior.
   * @param observer A single object containing `next` and `error` callbacks.
   * @return An unsubscribe function that can be called to cancel
   * the snapshot listener.
   */
  onSnapshot(
    options: firestore.SnapshotListenOptions,
    observer: {
      next?: (snapshot: QuerySnapshot<key, value>) => void;
      error?: (error: Error) => void;
      complete?: () => void;
    }
  ): () => void;

  /**
   * Attaches a listener for QuerySnapshot events. You may either pass
   * individual `onNext` and `onError` callbacks or pass a single observer
   * object with `next` and `error` callbacks. The listener can be cancelled by
   * calling the function that is returned when `onSnapshot` is called.
   *
   * NOTE: Although an `onCompletion` callback can be provided, it will
   * never be called because the snapshot stream is never-ending.
   *
   * @param onNext A callback to be called every time a new `QuerySnapshot`
   * is available.
   * @param onError A callback to be called if the listen fails or is
   * cancelled. No further callbacks will occur.
   * @return An unsubscribe function that can be called to cancel
   * the snapshot listener.
   */
  onSnapshot(
    onNext: (snapshot: QuerySnapshot<key, value>) => void,
    onError?: (error: Error) => void,
    onCompletion?: () => void
  ): () => void;

  /**
   * Attaches a listener for QuerySnapshot events. You may either pass
   * individual `onNext` and `onError` callbacks or pass a single observer
   * object with `next` and `error` callbacks. The listener can be cancelled by
   * calling the function that is returned when `onSnapshot` is called.
   *
   * NOTE: Although an `onCompletion` callback can be provided, it will
   * never be called because the snapshot stream is never-ending.
   *
   * @param options Options controlling the listen behavior.
   * @param onNext A callback to be called every time a new `QuerySnapshot`
   * is available.
   * @param onError A callback to be called if the listen fails or is
   * cancelled. No further callbacks will occur.
   * @return An unsubscribe function that can be called to cancel
   * the snapshot listener.
   */
  onSnapshot(
    options: firestore.SnapshotListenOptions,
    onNext: (snapshot: QuerySnapshot<key, value>) => void,
    onError?: (error: Error) => void,
    onCompletion?: () => void
  ): () => void;
};

/**
 * A `QuerySnapshot` contains zero or more `DocumentSnapshot` objects
 * representing the results of a query. The documents can be accessed as an
 * array via the `docs` property or enumerated using the `forEach` method. The
 * number of documents can be determined via the `empty` and `size`
 * properties.
 */
type QuerySnapshot<key extends string, value extends DocumentData> = {
  /**
   * The query on which you called `get` or `onSnapshot` in order to get this
   * `QuerySnapshot`.
   */
  readonly query: Query<key, value>;

  /**
   * Metadata about this snapshot, concerning its source and if it has local
   * modifications.
   */
  readonly metadata: firestore.SnapshotMetadata;

  /** An array of all the documents in the `QuerySnapshot`. */
  readonly docs: Array<QueryDocumentSnapshot<key, value>>;

  /** The number of documents in the `QuerySnapshot`. */
  readonly size: number;

  /** True if there are no documents in the `QuerySnapshot`. */
  readonly empty: boolean;

  /**
   * Returns an array of the documents changes since the last snapshot. If this
   * is the first snapshot, all documents will be in the list as added changes.
   *
   * @param options `SnapshotListenOptions` that control whether metadata-only
   * changes (i.e. only `DocumentSnapshot.metadata` changed) should trigger
   * snapshot events.
   */
  readonly docChanges: (
    options?: firestore.SnapshotListenOptions
  ) => ReadonlyArray<DocumentChange<key, value>>;

  /**
   * Enumerates all of the documents in the `QuerySnapshot`.
   *
   * @param callback A callback to be called with a `QueryDocumentSnapshot` for
   * each document in the snapshot.
   * @param thisArg The `this` binding for the callback.
   */
  readonly forEach: (
    callback: (result: QueryDocumentSnapshot<key, value>) => void,
    thisArg?: any
  ) => void;

  /**
   * Returns true if this `QuerySnapshot` is equal to the provided one.
   *
   * @param other The `QuerySnapshot` to compare against.
   * @return true if this `QuerySnapshot` is equal to the provided one.
   */
  readonly isEqual: (other: QuerySnapshot<key, value>) => boolean;
};

/**
 * A `DocumentChange` represents a change to the documents matching a query.
 * It contains the document affected and the type of change that occurred.
 */
type DocumentChange<key extends string, value extends DocumentData> = {
  /** The type of change ('added', 'modified', or 'removed'). */
  readonly type: firestore.DocumentChangeType;

  /** The document affected by this change. */
  readonly doc: QueryDocumentSnapshot<key, value>;

  /**
   * The index of the changed document in the result set immediately prior to
   * this `DocumentChange` (i.e. supposing that all prior `DocumentChange` objects
   * have been applied). Is -1 for 'added' events.
   */
  readonly oldIndex: number;

  /**
   * The index of the changed document in the result set immediately after
   * this `DocumentChange` (i.e. supposing that all prior `DocumentChange`
   * objects and the current `DocumentChange` object have been applied).
   * Is -1 for 'removed' events.
   */
  readonly newIndex: number;
};

/**
 * A `CollectionReference` object can be used for adding documents, getting
 * document references, and querying for documents (using the methods
 * inherited from `Query`).
 */
type CollectionReference<
  docAndSub extends DocumentAndSubCollectionData
> = Query<docAndSub["key"], docAndSub["value"]> & {
  /** The collection's identifier. */
  readonly id: string;

  /**
   * A reference to the containing `DocumentReference` if this is a subcollection.
   * If this isn't a subcollection, the reference is null.
   */
  readonly parent: DocumentReference<docAndSub> | null;

  /**
   * A string representing the path of the referenced collection (relative
   * to the root of the database).
   */
  readonly path: string;

  /**
   * Get a `DocumentReference` for the document within the collection at the
   * specified path. If no path is specified, an automatically-generated
   * unique ID will be used for the returned DocumentReference.
   *
   * @param documentPath A slash-separated path to a document.
   * @return The `DocumentReference` instance.
   */
  readonly doc: <T extends docAndSub["key"]>(
    documentPath?: T
  ) => DocumentReference<Extract<docAndSub, { key: T }>>;

  /**
   * Add a new document to this collection with the specified data, assigning
   * it a document ID automatically.
   *
   * @param data An Object containing the data for the new document.
   * @return A Promise resolved with a `DocumentReference` pointing to the
   * newly created document after it has been written to the backend.
   */
  readonly add: (
    data: docAndSub["value"]
  ) => Promise<DocumentReference<docAndSub>>;

  /**
   * Returns true if this `CollectionReference` is equal to the provided one.
   *
   * @param other The `CollectionReference` to compare against.
   * @return true if this `CollectionReference` is equal to the provided one.
   */
  readonly isEqual: (other: CollectionReference<docAndSub>) => boolean;
};
