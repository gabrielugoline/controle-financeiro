document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector("tbody");
  const descInput = document.querySelector("#desc");
  const amountInput = document.querySelector("#amount");
  const typeSelect = document.querySelector("#type");
  const btnAdd = document.querySelector("#btnAdd");
  const btnLoad = document.querySelector("#btnLoad");

  const monthSelect = document.querySelector("#month");
  const yearInput = document.querySelector("#year");

  const incomesElem = document.querySelector("#incomes");
  const expensesElem = document.querySelector("#expenses");
  const totalElem = document.querySelector("#total");

  // Novo campo de data de vencimento
  const dueDateInput = document.querySelector("#dueDate");

  let transactions = [];

  // Adicionando a lógica para o botão "Adicionar"
  btnAdd.onclick = () => {
    if (!descInput.value || !amountInput.value || !typeSelect.value || !dueDateInput.value) {
      return alert("Preencha todos os campos!");
    }

    // Captura da data de vencimento
    const dueDate = new Date(dueDateInput.value);

    // Captura da data do mês e ano selecionado
    const date = new Date(yearInput.value, monthSelect.value);

    transactions.push({
      desc: descInput.value,
      amount: parseFloat(amountInput.value).toFixed(2),
      type: typeSelect.value,
      date: date,
      dueDate: dueDate // Agora estamos guardando a data de vencimento também
    });

    updateLocalStorage();
    renderTransactions();
    resetInputs();
  };

  // Carregar transações ao clicar no botão "Carregar"
  btnLoad.onclick = () => {
    renderTransactions();
  };

  function deleteTransaction(index) {
    transactions.splice(index, 1);
    updateLocalStorage();
    renderTransactions();
  }

  // Renderizando as transações
  function renderTransaction(transaction, index) {
    const tr = document.createElement("tr");

    // Formatando a data de vencimento
    const formattedDueDate = new Date(transaction.dueDate).toLocaleDateString('pt-BR');

    tr.innerHTML = `
      <td>${transaction.desc}</td>
      <td>R$ ${transaction.amount}</td>
      <td class="column-type">
        ${transaction.type === "Entrada" ? '<i class="bx bxs-chevron-up-circle"></i>' : '<i class="bx bxs-chevron-down-circle"></i>'}
      </td>
      <td>${formattedDueDate}</td> <!-- Exibindo a data de vencimento -->
      <td class="column-action">
        <button class="delete-btn" data-index="${index}"><i class='bx bx-trash'></i></button>
      </td>
    `;

    tbody.appendChild(tr);
  }

  function renderTransactions() {
    transactions = getTransactionsFromLocalStorage();
    tbody.innerHTML = "";

    const selectedMonth = parseInt(monthSelect.value);
    const selectedYear = parseInt(yearInput.value);

    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === selectedMonth && transactionDate.getFullYear() === selectedYear;
    });

    filteredTransactions.forEach((transaction, index) => {
      renderTransaction(transaction, index);
    });

    updateTotals(filteredTransactions);
    attachDeleteEventListeners();
  }

  function attachDeleteEventListeners() {
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach(button => {
      button.onclick = () => {
        const index = button.getAttribute("data-index");
        deleteTransaction(index);
      };
    });
  }

  function updateTotals(filteredTransactions) {
    const incomeAmounts = filteredTransactions
      .filter(transaction => transaction.type === "Entrada")
      .map(transaction => Number(transaction.amount));

    const expenseAmounts = filteredTransactions
      .filter(transaction => transaction.type === "Saída")
      .map(transaction => Number(transaction.amount));

    const totalIncome = incomeAmounts
      .reduce((acc, cur) => acc + cur, 0)
      .toFixed(2);

    const totalExpense = Math.abs(
      expenseAmounts.reduce((acc, cur) => acc + cur, 0)
    ).toFixed(2);

    const totalBalance = (totalIncome - totalExpense).toFixed(2);

    incomesElem.textContent = `R$ ${totalIncome}`;
    expensesElem.textContent = `R$ ${totalExpense}`;
    totalElem.textContent = `R$ ${totalBalance}`;
  }

  function getTransactionsFromLocalStorage() {
    return JSON.parse(localStorage.getItem("transactions")) ?? [];
  }

  function updateLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }

  function resetInputs() {
    descInput.value = "";
    amountInput.value = "";
    typeSelect.value = "";
    dueDateInput.value = ""; // Limpando o campo de data de vencimento
  }

  renderTransactions();
});
