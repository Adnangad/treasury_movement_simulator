import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const url = "https://2d36043c-7ea6-451f-b25c-756de9a219d3-00-kaw91cbjd683.janeway.replit.dev/graphql";
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [newAccountName, setNewAccount] = useState("");
  const [newAmount, setNewAmount] = useState(0);
  const [newCurrency, setNewCurrency] = useState("KSHS");
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState(0);
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    async function getAccounts() {
      try {
        const query = `
          query {
            allAccounts {
              id
              accountName
              amount
              currency
            }
          }`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const rez = await response.json();
        setAccounts(rez.data.allAccounts);
      } catch (error) {
        setError("Failed to load accounts.");
      }
    }

    async function getLogs() {
      try {
        const query = `
          query {
            allLogs {
              From
              To
              Amount
              TransactionCode
              Time
              Note
            }
          }`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const rez = await response.json();
        setLogs(rez.data.allLogs.reverse());
      } catch (error) {
        setError("Failed to load logs.");
      }
    }

    getAccounts();
    getLogs();
  }, []);

  async function transferFunds() {
    try {
      setMessage('');
      setError('');

      if (!fromAccount || !toAccount) throw new Error("Please select valid accounts.");
      if (fromAccount === toAccount) throw new Error("You cannot transfer to the same account.");
      if (amount < 1) throw new Error("Cannot transfer less than 1.");

      const query = `
        mutation {
          transferAmoney(accountId: ${fromAccount}, receiverId: ${toAccount}, amount: ${Number(amount)}, note: "${note}") {
            message
            status
          }
        }`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const rez = await response.json();
      console.log(rez);

      if (rez.errors) {
        setError("❌ " + rez.errors[0]?.message || "Something went wrong.");
        return;
      }
      if (rez.data.transferAmoney.status === "Error") {
        setError("❌ " + rez.data.transferAmoney.message || "Something went wrong.");
        return;
      }

      setMessage("✅ Transfer successful!");
      setTimeout(() => window.location.reload(), 20000);
    } catch (err) {
      setError("❌ " + err.message);
    }
  }

  async function createAccount() {
    try {
      setMessage('');
      setError('');

      if (newAccountName.length < 4) throw new Error("Please input a valid account name.");
      if (newAmount < 1) throw new Error("Amount must be at least 1.");

      const query = `
        mutation {
          createAccounts(accountName: "${newAccountName}", amount: ${Number(newAmount)}, currency: "${newCurrency}") {
            message
            status
          }
        }`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const rez = await response.json();

      if (rez.errors) {
        setError("❌ " + rez.errors[0]?.message || "Something went wrong.");
        return;
      }
      if (rez.data.createAccounts.status === "Error") {
        setError("❌ " + rez.data.createAccounts.message || "Something went wrong.");
        return;
      }

      setMessage("✅ Account created successfully!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError("❌ " + err.message);
    }
  }
  const [logFilterAccount, setLogFilterAccount] = useState('');
  const [logsPage, setLogsPage] = useState(1);
  const logsPerPage = 5;

  const indexOfLastAccount = currentPage * itemsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - itemsPerPage;
  const currentAccounts = accounts.slice(indexOfFirstAccount, indexOfLastAccount);
  const totalPages = Math.ceil(accounts.length / itemsPerPage);
  const filteredLogs = logFilterAccount
    ? logs.filter(log => log.From === logFilterAccount || log.To === logFilterAccount)
    : logs;

  const indexOfLastLog = logsPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalLogPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <div className="container">
      <h1>Treasury Movement Simulator</h1>

      <div className="tabs">
        <button className={activeTab === 'accounts' ? 'active' : ''} onClick={() => setActiveTab('accounts')}>
          Accounts
        </button>
        <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>
          Logs
        </button>
      </div>

      {(message || error) && (
        <div className="messages">
          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}
        </div>
      )}

      {activeTab === 'accounts' && (
        <>
          <h2>All Accounts</h2>
          <table>
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Balance</th>
                <th>Currency</th>
              </tr>
            </thead>
            <tbody>
              {currentAccounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.accountName}</td>
                  <td>{account.amount.toFixed(2)}</td>
                  <td>{account.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>

            <span>Page {currentPage} of {totalPages}</span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>

          <div className="forms">
            <div>
              <h3>Create Account</h3>
              <input placeholder="Account Name" value={newAccountName} onChange={(e) => setNewAccount(e.target.value)} />
              <input placeholder="Amount" type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
              <select value={newCurrency} onChange={(e) => setNewCurrency(e.target.value)}>
                <option value="KSHS">KSHS</option>
                <option value="USD">USD</option>
                <option value="NGN">NGN</option>
              </select>
              <button className="submitButton" onClick={createAccount}>Create Account</button>
            </div>

            <div>
              <h3>Transfer Money</h3>
              <select value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
                <option value="">From Account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.accountName}</option>
                ))}
              </select>
              <select value={toAccount} onChange={(e) => setToAccount(e.target.value)}>
                <option value="">To Account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.accountName}</option>
                ))}
              </select>
              <input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <input placeholder="Optional Note" type="text" value={note} onChange={(e) => setNote(e.target.value)} />
              <button onClick={transferFunds} className="submitButton">Transfer Money</button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'logs' && (
        <>
          <h2>Logs</h2>
          <div style={{ marginBottom: "10px" }}>
            <label>Filter by Account: </label>
            <select
              value={logFilterAccount}
              onChange={(e) => {
                setLogFilterAccount(e.target.value);
                setLogsPage(1);
              }}
            >
              <option value="">All</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.accountName}>
                  {account.accountName}
                </option>
              ))}
            </select>
          </div>

          <table>
            <thead>
              <tr>
                <th>From Account</th>
                <th>To Account</th>
                <th>Amount</th>
                <th>Transaction Code</th>
                <th>Note</th>
                <th>TimeStamp</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log, index) => (
                <tr key={index}>
                  <td>{log.From}</td>
                  <td>{log.To}</td>
                  <td>{log.Amount}</td>
                  <td>{log.TransactionCode}</td>
                  <td>{log.Note || "No note"}</td>
                  <td>{log.Time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button
              disabled={logsPage === 1}
              onClick={() => setLogsPage((prev) => prev - 1)}
            >
              Previous
            </button>

            <span>Page {logsPage} of {totalLogPages}</span>

            <button
              disabled={logsPage === totalLogPages}
              onClick={() => setLogsPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

    </div>
  );
}

export default App;
