const apartments = [
    { id: '1 RoK', size: 38.1, debtShare: 0.00226, operatingShare: 0.00226 },
    { id: '1 RoK', size: 38.1, debtShare: 0.00226, operatingShare: 0.00226 },
    { id: '1 RoK', size: 38.1, debtShare: 0.00226, operatingShare: 0.00226 },
    { id: '1 RoK', size: 38.1, debtShare: 0.00226, operatingShare: 0.00226 },
    { id: '4 RoK', size: 100.2, debtShare: 0.005734, operatingShare: 0.005734 },
    { id: '5 RoK', size: 111.5, debtShare: 0.006265, operatingShare: 0.006265 },
    { id: '5 RoK', size: 114.0, debtShare: 0.006535, operatingShare: 0.006535 },
    { id: '6 RoK', size: 128.5, debtShare: 0.007217, operatingShare: 0.007217 },
];

const totalLoan = 40000000/28; // Totalt lån
const annualOperatingCost = 10000000/28; // Årliga driftkostnader

function formatNumber(number) {
    return new Intl.NumberFormat('sv-SE').format(Math.round(number));
}

function calculatePercentShares() {
    const totalDebtShares = apartments.reduce((sum, apt) => sum + apt.debtShare, 0);
    const totalOperatingShares = apartments.reduce((sum, apt) => sum + apt.operatingShare, 0);

    return apartments.map(apartment => ({
        ...apartment,
        debtPercent: (apartment.debtShare / totalDebtShares) * 100,
        operatingPercent: (apartment.operatingShare / totalOperatingShares) * 100
    }));
}

function generateContributionForm() {
    const tbody = document.getElementById('contributionTableBody');
    const apartmentsWithPercent = calculatePercentShares();

    let rows = apartmentsWithPercent.map((apartment, index) => {
        const debtAmount = totalLoan * (apartment.debtPercent / 100);

        return `
        <tr>
            <td>${apartment.id}</td>
            <td>
                <input type="number" class="form-control d-inline-block" id="contribution${index}" style="width: auto;" min="0" max="${debtAmount}" placeholder="Ange belopp" oninput="calculateWithContribution()">
            </td>
            <td>
                ${formatNumber(debtAmount)} kr
            </td>
            <td id="contributionsAdjusted${index}">
                ${formatNumber(debtAmount)} kr
            </td>
        </tr>
    `}).join('');
    tbody.innerHTML = rows;
}


function calculateInitial() {
    const resultTable = document.getElementById('resultTable');
    const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;

    const apartmentsWithPercent = calculatePercentShares();
    
    let rows = apartmentsWithPercent.map(apartment => {
        const debtAmount = totalLoan * (apartment.debtPercent / 100);
        const debtFee = debtAmount * interestRate;
        const operatingFee = annualOperatingCost * (apartment.operatingPercent / 100);
        const totalMonthlyFee = (debtFee + operatingFee) / 12;

        return `
            <tr>
                <td>${apartment.id}</td>
                <td>${apartment.size} kvm</td>
                <td>${apartment.debtShare.toFixed(6)} (${apartment.debtPercent.toFixed(1)}%)</td>
                <td>${formatNumber(debtAmount)} kr</td>
                <td>${formatNumber(debtFee/12)} kr</td>
                <td>${apartment.operatingShare.toFixed(6)} (${apartment.operatingPercent.toFixed(1)}%)</td>
                <td>${formatNumber(operatingFee/12)} kr</td>
                <td>${formatNumber(totalMonthlyFee)} kr</td>
            </tr>`;
    }).join('');

    
    resultTable.innerHTML = `
      <thead>
        <tr>
          <th>Lägenhet</th>
          <th>Storlek</th>
          <th>Skuldandelstal</th>
          <th>Del av Skuld (kr)</th>
          <th>Månadskostnad räntedel (kr)</th>
          <th>Driftsandelstal</th>
          <th>Månadskostnad driftsdel (kr)</th>
          <th>Total Månadsavgift (kr)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr>
                <th>Summa:</th>
                <th></th>
                <th>${apartments.reduce((sum, apt) => sum + apt.debtShare, 0).toFixed(6)} (${formatNumber(apartmentsWithPercent.reduce((sum, apt) => sum + apt.debtPercent, 0))}%)</th>
                <th>${formatNumber(apartmentsWithPercent.reduce((sum, apt) => sum + totalLoan * (apt.debtPercent / 100), 0))} kr</th>
                <th>${formatNumber(apartmentsWithPercent.reduce((sum, apt) => sum + totalLoan / 12 * (apt.debtPercent / 100) * interestRate, 0))} kr</th>
                <th>${apartments.reduce((sum, apt) => sum + apt.operatingShare, 0).toFixed(6)} (${formatNumber(apartmentsWithPercent.reduce((sum, apt) => sum + apt.operatingPercent, 0))}%)</th>
                <th>${formatNumber(apartmentsWithPercent.reduce((sum, apt) => sum + annualOperatingCost / 12 * (apt.operatingPercent / 100), 0))} kr</th>
                <th>${formatNumber(apartmentsWithPercent.reduce((sum, apt) => sum + annualOperatingCost / 12 * (apt.operatingPercent / 100), 0) + apartmentsWithPercent.reduce((sum, apt) => sum + totalLoan / 12 * (apt.debtPercent / 100) * interestRate, 0))} kr</th>
        </tr>
      </tbody>
    `;
}

// Funktion för att uppdatera HTML med data
function updateInputData() {
    const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;
    document.getElementById('annualFeesDisplay').textContent = `${formatNumber(annualOperatingCost)} kr (per månad: ` + formatNumber(annualOperatingCost/12) + ` kr)`;
    document.getElementById('annualRatesDisplay').textContent = `${formatNumber(totalLoan * interestRate)} kr (per månad: ` + formatNumber(totalLoan * interestRate/12) + ` kr)`;

    document.getElementById('totalLoanDisplay').textContent = `${formatNumber(totalLoan)} kr`;
}

function updateInterestRate() {

}

function calculateWithContribution() {
    updateInputData();
    calculateInitial();
    const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;

    if (isNaN(interestRate) || interestRate < 0) {
        alert("Ange ett giltigt räntetal.");
        return;
    }

    const contributions = apartments.map((_, index) =>
        parseFloat(document.getElementById(`contribution${index}`).value) || 0
    );

    if (contributions.some(val => val < 0)) {
        alert("Vänligen ange endast positiva tal för kapitaltillskott.");
        return;
    }

    const contributionResultTable = document.getElementById('contributionResultTable');
    const totalDebtShares = apartments.reduce((sum, apt) => sum + apt.debtShare, 0);

    // Beräkna justerade skulder och nya skuldandelstal
    let adjustedDebts = [];
    let newDebtShares = [];
    let initialDebts = [];
    let initialPercentage = [];
    let totalAdjustedDebt = 0;

    apartments.forEach((apartment, index) => {
        let initialDebtAmount = totalLoan * (apartment.debtShare / totalDebtShares);
        let adjustedDebt = initialDebtAmount - contributions[index];
        adjustedDebts.push(adjustedDebt);
        totalAdjustedDebt += adjustedDebt;
        newDebtShares.push(apartment.debtShare * (1 - (contributions[index] / initialDebtAmount)));
        initialDebts.push(initialDebtAmount);
        initialPercentage.push((initialDebtAmount / totalLoan) * 100);
        contributionsAdjusted = document.getElementById('contributionsAdjusted' + index);
        contributionsAdjusted.innerHTML = formatNumber(adjustedDebt) + ' kr';
    });

    let rows = apartments.map((apartment, index) => {
        const adjustedDebtFee = adjustedDebts[index] * interestRate;
        const initialDebtFee = initialDebts[index] * interestRate;
        const newDebtPercentage = (adjustedDebts[index] / totalAdjustedDebt) * 100;
        
        const operatingFee = annualOperatingCost * (apartment.operatingShare / apartments.reduce((sum, apt) => sum + apt.operatingShare, 0));
        const totalMonthlyFee = (adjustedDebtFee + operatingFee) / 12;
        const initialTotalMonthlyFee = (initialDebtFee + operatingFee) / 12;

        // Funktion för att markera ändrade värden
        function highlightChange(initialValue, currentValue) {
            return initialValue !== currentValue ? `<b><u>${currentValue}</u></b>` : currentValue;
        }

        return `
            <tr>
                <td>${apartment.id}</td>
                <td>${apartment.size}</td>
                <td>${highlightChange(apartments[index].debtShare.toFixed(6), newDebtShares[index].toFixed(6))} ${highlightChange('(' + initialPercentage[index].toFixed(1) + '%)','(' + newDebtPercentage.toFixed(1) + '%)')}</td>
                <td>${highlightChange(formatNumber(initialDebts[index]), formatNumber(adjustedDebts[index]))} kr</td>
                <td>${highlightChange(formatNumber(initialDebtFee/12), formatNumber(adjustedDebtFee/12))} kr</td>
                <td>${apartment.operatingShare.toFixed(6)} (${(apartment.operatingShare / apartments.reduce((sum, apt) => sum + apt.operatingShare, 0) * 100).toFixed(1)}%)</td>
                <td>${formatNumber(operatingFee/12)} kr</td>
                <td>${highlightChange(formatNumber(initialTotalMonthlyFee), formatNumber(totalMonthlyFee))} kr</td>
            </tr>`;
    }).join('');

    const apartmentsWithPercent = calculatePercentShares();

    contributionResultTable.innerHTML = `
      <thead>
        <tr>
          <th>Lägenhet</th>
          <th>Storlek</th>
          <th>Skuldandelstal</th>
          <th>Del av Skuld (kr)</th>
          <th>Månadskostnad räntedel (kr)</th>
          <th>Driftsandelstal</th>
          <th>Månadskostnad driftsdel (kr)</th>
          <th>Total Månadsavgift (kr)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr>
                <th>Summa:</th>
                <th></th>
                <th>${newDebtShares.reduce((sum, apt) => sum + apt, 0).toFixed(6)} (${formatNumber(adjustedDebts.reduce((sum, apt) => sum + apt / totalAdjustedDebt * 100, 0))}%)</th>
                <th>${formatNumber(adjustedDebts.reduce((sum, apt) => sum + apt, 0))} kr</th>
                <th>${formatNumber(adjustedDebts.reduce((sum, apt) => sum + apt * interestRate / 12, 0))} kr</th>
                <th>${apartments.reduce((sum, apt) => sum + apt.operatingShare, 0).toFixed(6)} (${formatNumber(apartmentsWithPercent.reduce((sum, apt) => sum + apt.operatingPercent, 0))}%)</th>
                <th>${formatNumber(apartmentsWithPercent.reduce((sum, apt) => sum + annualOperatingCost / 12 * (apt.operatingPercent / 100), 0))} kr</th>
                <th>${formatNumber(adjustedDebts.reduce((sum, apt) => sum + apt * interestRate / 12, 0) + apartmentsWithPercent.reduce((sum, apt) => sum + annualOperatingCost / 12 * (apt.operatingPercent / 100), 0))} kr</th>

                </tr>
      </tbody>
    `;
}




// Initiera formulär och initialberäkningar
document.addEventListener('DOMContentLoaded', () => {
    updateInputData();
    generateContributionForm();
    calculateInitial();
    calculateWithContribution();
});
