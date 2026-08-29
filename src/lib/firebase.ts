import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import {
  BusinessProfile,
  Client,
  Quotation,
  Invoice,
  BankAccount,
  BankTransaction,
  Expense,
  SarsComplianceProfile,
  SarsFilingItem,
} from "../types";

// Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial connection test
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firebase client is connecting...");
    }
  }
}
testConnection();

// Authentication helpers
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Firebase Google Auth Error:", error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase Logout Error:", error);
    throw error;
  }
}

// Cloud persistence helpers
export async function saveProfileToCloud(userId: string, profile: BusinessProfile) {
  const path = `users/${userId}/profile/business`;
  try {
    await setDoc(doc(db, "users", userId, "profile", "business"), {
      ...profile,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveClientToCloud(userId: string, client: Client) {
  const path = `users/${userId}/clients/${client.id}`;
  try {
    await setDoc(doc(db, "users", userId, "clients", client.id), {
      ...client,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteClientFromCloud(userId: string, clientId: string) {
  const path = `users/${userId}/clients/${clientId}`;
  try {
    await deleteDoc(doc(db, "users", userId, "clients", clientId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveQuotationToCloud(userId: string, quotation: Quotation) {
  const path = `users/${userId}/quotations/${quotation.id}`;
  try {
    await setDoc(doc(db, "users", userId, "quotations", quotation.id), {
      ...quotation,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteQuotationFromCloud(userId: string, quotationId: string) {
  const path = `users/${userId}/quotations/${quotationId}`;
  try {
    await deleteDoc(doc(db, "users", userId, "quotations", quotationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveInvoiceToCloud(userId: string, invoice: Invoice) {
  const path = `users/${userId}/invoices/${invoice.id}`;
  try {
    await setDoc(doc(db, "users", userId, "invoices", invoice.id), {
      ...invoice,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteInvoiceFromCloud(userId: string, invoiceId: string) {
  const path = `users/${userId}/invoices/${invoiceId}`;
  try {
    await deleteDoc(doc(db, "users", userId, "invoices", invoiceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveBankAccountToCloud(userId: string, account: BankAccount) {
  const path = `users/${userId}/bankAccounts/${account.id}`;
  try {
    await setDoc(doc(db, "users", userId, "bankAccounts", account.id), {
      ...account,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBankAccountFromCloud(userId: string, accountId: string) {
  const path = `users/${userId}/bankAccounts/${accountId}`;
  try {
    await deleteDoc(doc(db, "users", userId, "bankAccounts", accountId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveBankTransactionToCloud(userId: string, tx: BankTransaction) {
  const path = `users/${userId}/bankTransactions/${tx.id}`;
  try {
    await setDoc(doc(db, "users", userId, "bankTransactions", tx.id), {
      ...tx,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBankTransactionFromCloud(userId: string, txId: string) {
  const path = `users/${userId}/bankTransactions/${txId}`;
  try {
    await deleteDoc(doc(db, "users", userId, "bankTransactions", txId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveExpenseToCloud(userId: string, expense: Expense) {
  const path = `users/${userId}/expenses/${expense.id}`;
  try {
    await setDoc(doc(db, "users", userId, "expenses", expense.id), {
      ...expense,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExpenseFromCloud(userId: string, expenseId: string) {
  const path = `users/${userId}/expenses/${expenseId}`;
  try {
    await deleteDoc(doc(db, "users", userId, "expenses", expenseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSarsProfileToCloud(userId: string, prof: SarsComplianceProfile) {
  const path = `users/${userId}/sars/compliance`;
  try {
    await setDoc(doc(db, "users", userId, "sars", "compliance"), prof);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveSarsFilingToCloud(userId: string, filing: SarsFilingItem) {
  const path = `users/${userId}/sarsFilings/${filing.id}`;
  try {
    await setDoc(doc(db, "users", userId, "sarsFilings", filing.id), {
      ...filing,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Bulk Upload Local Data to Cloud
export async function uploadAllLocalDataToCloud(
  userId: string,
  data: {
    profile: BusinessProfile;
    clients: Client[];
    quotations: Quotation[];
    invoices: Invoice[];
    bankAccounts: BankAccount[];
    bankTransactions: BankTransaction[];
    expenses: Expense[];
    sarsProfile?: SarsComplianceProfile;
    sarsFilings?: SarsFilingItem[];
  }
) {
  await saveProfileToCloud(userId, data.profile);
  if (data.sarsProfile) await saveSarsProfileToCloud(userId, data.sarsProfile);

  for (const c of data.clients) await saveClientToCloud(userId, c);
  for (const q of data.quotations) await saveQuotationToCloud(userId, q);
  for (const inv of data.invoices) await saveInvoiceToCloud(userId, inv);
  for (const acc of data.bankAccounts) await saveBankAccountToCloud(userId, acc);
  for (const tx of data.bankTransactions) await saveBankTransactionToCloud(userId, tx);
  for (const exp of data.expenses) await saveExpenseToCloud(userId, exp);
  if (data.sarsFilings) {
    for (const f of data.sarsFilings) await saveSarsFilingToCloud(userId, f);
  }
}

// Subscribe to real-time user updates
export function subscribeToUserCloudData(
  userId: string,
  onData: (data: {
    profile?: BusinessProfile;
    clients?: Client[];
    quotations?: Quotation[];
    invoices?: Invoice[];
    bankAccounts?: BankAccount[];
    bankTransactions?: BankTransaction[];
    expenses?: Expense[];
    sarsProfile?: SarsComplianceProfile;
    sarsFilings?: SarsFilingItem[];
  }) => void
): () => void {
  const unsubs: Unsubscribe[] = [];

  // Profile listener
  const profPath = `users/${userId}/profile/business`;
  const unsubProfile = onSnapshot(
    doc(db, "users", userId, "profile", "business"),
    (snap) => {
      if (snap.exists()) {
        onData({ profile: snap.data() as BusinessProfile });
      }
    },
    (err) => handleFirestoreError(err, OperationType.GET, profPath)
  );
  unsubs.push(unsubProfile);

  // Clients listener
  const clientsPath = `users/${userId}/clients`;
  const unsubClients = onSnapshot(
    collection(db, "users", userId, "clients"),
    (snap) => {
      const list = snap.docs.map((d) => d.data() as Client);
      onData({ clients: list });
    },
    (err) => handleFirestoreError(err, OperationType.LIST, clientsPath)
  );
  unsubs.push(unsubClients);

  // Quotations listener
  const quotesPath = `users/${userId}/quotations`;
  const unsubQuotes = onSnapshot(
    collection(db, "users", userId, "quotations"),
    (snap) => {
      const list = snap.docs.map((d) => d.data() as Quotation);
      onData({ quotations: list });
    },
    (err) => handleFirestoreError(err, OperationType.LIST, quotesPath)
  );
  unsubs.push(unsubQuotes);

  // Invoices listener
  const invsPath = `users/${userId}/invoices`;
  const unsubInvoices = onSnapshot(
    collection(db, "users", userId, "invoices"),
    (snap) => {
      const list = snap.docs.map((d) => d.data() as Invoice);
      onData({ invoices: list });
    },
    (err) => handleFirestoreError(err, OperationType.LIST, invsPath)
  );
  unsubs.push(unsubInvoices);

  // Bank Accounts listener
  const accountsPath = `users/${userId}/bankAccounts`;
  const unsubAccounts = onSnapshot(
    collection(db, "users", userId, "bankAccounts"),
    (snap) => {
      const list = snap.docs.map((d) => d.data() as BankAccount);
      onData({ bankAccounts: list });
    },
    (err) => handleFirestoreError(err, OperationType.LIST, accountsPath)
  );
  unsubs.push(unsubAccounts);

  // Bank Transactions listener
  const txsPath = `users/${userId}/bankTransactions`;
  const unsubTx = onSnapshot(
    collection(db, "users", userId, "bankTransactions"),
    (snap) => {
      const list = snap.docs.map((d) => d.data() as BankTransaction);
      onData({ bankTransactions: list });
    },
    (err) => handleFirestoreError(err, OperationType.LIST, txsPath)
  );
  unsubs.push(unsubTx);

  // Expenses listener
  const expensesPath = `users/${userId}/expenses`;
  const unsubExpenses = onSnapshot(
    collection(db, "users", userId, "expenses"),
    (snap) => {
      const list = snap.docs.map((d) => d.data() as Expense);
      onData({ expenses: list });
    },
    (err) => handleFirestoreError(err, OperationType.LIST, expensesPath)
  );
  unsubs.push(unsubExpenses);

  return () => {
    unsubs.forEach((u) => u());
  };
}
