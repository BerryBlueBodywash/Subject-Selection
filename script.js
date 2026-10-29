let subjectData = {};
let selectedSubjects = {};   

const yearSelect = document.getElementById("yearSelect");
const subjectsContainer = document.getElementById("subjects");
const selectedList = document.getElementById("selectedList"); 

fetch("./subjects.json")
    .then(response => response.json())
    .then(data => {
        subjectData = data;
        const years = Object.keys(subjectData);

        // trigger default render for the initial selected year
        if (years.length > 0) {
            yearSelect.value = years[0];
            yearSelect.dispatchEvent(new Event('change'));
        }
    });

function isSelected(year, name) { 
    return selectedSubjects[year] && selectedSubjects[year].includes(name);
}

function updateSelectedList() {
    if (!selectedList) return;
    selectedList.innerHTML = "";
    Object.keys(selectedSubjects).forEach(year => {
        selectedSubjects[year].forEach(sub => {
            const li = document.createElement("li");
            li.textContent = `year ${year}: ${sub}`;
            selectedList.appendChild(li);
        });
    });
}

yearSelect.addEventListener("change", () => {
    const selectedYear = yearSelect.value;
    subjectsContainer.innerHTML = ""; //starts off empty

    if (!selectedYear) {
        return;
    }

    const currentYearData = subjectData[selectedYear];
    const subjects = currentYearData.subjects;

    // display year requirements at the top if present
    if (currentYearData.requirements && currentYearData.requirements.length > 0) {
        const reqDiv = document.createElement("div");
        reqDiv.classList.add("year-requirements");
        reqDiv.innerHTML = `<strong>year level requirements:</strong> ${currentYearData.requirements.join(", ")}`;
        subjectsContainer.appendChild(reqDiv);
    }

    // card for every subject
    subjects.forEach(subject => {
        const subjectCard = document.createElement("div");
        subjectCard.classList.add("subject-card");

        // put in the heading
        const subjectHeader = document.createElement("button");
        subjectHeader.classList.add("subject-header");
        subjectHeader.textContent = subject.name;

        // put in the information
        const subjectInfo = document.createElement("div");
        subjectInfo.classList.add("subject-info");

        // prerequisites 
        const prereqs = document.createElement("p");
        let prereqText;

        if (subject.prereqs && subject.prereqs.length > 0) {
            prereqText = subject.prereqs.join(", "); 
        } else {
            prereqText = "none";
        }

        prereqs.innerHTML = `
            <strong>prerequisites:</strong>
            ${prereqText}
        `;
        subjectInfo.appendChild(prereqs);

        // time
        const time = document.createElement("p");
        time.innerHTML = `
            <strong>time:</strong>
            ${subject.time || "not specified"}
        `;
        subjectInfo.appendChild(time);

        // checkbox and name row
        const subjectRow = document.createElement("div");
        subjectRow.classList.add("subject-row");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("subject-checkbox");
        checkbox.checked = isSelected(selectedYear, subject.name);  

        function toggleSubject(year, name, checked) {
            if (!selectedSubjects[year]) {
                selectedSubjects[year] = [];
            }

            if (checked) {
                if (!selectedSubjects[year].includes(name)) {
                    selectedSubjects[year].push(name);
                }
            } else {
                selectedSubjects[year] = selectedSubjects[year].filter(
                    sub => sub !== name
                );
            }

            if (selectedSubjects[year].length === 0) {
                delete selectedSubjects[year];
            }

            updateSelectedList();
        }

        checkbox.addEventListener("change", () => {
            toggleSubject(selectedYear, subject.name, checkbox.checked); 
        });

        subjectRow.appendChild(checkbox);
        subjectRow.appendChild(subjectHeader);

        subjectCard.appendChild(subjectRow);
        subjectCard.appendChild(subjectInfo);

        subjectsContainer.appendChild(subjectCard);

        // expand/hidden toggle
        subjectHeader.addEventListener("click", () => {
            subjectCard.classList.toggle("expanded");
        });
    });
});

document.getElementById("downloadPDF").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const selectedYears = Object.keys(selectedSubjects).filter(
        year => Array.isArray(selectedSubjects[year]) &&
                selectedSubjects[year].length > 0
    );

    if (selectedYears.length === 0) {
        document.getElementById("downloadMessage").textContent =
            "please select at least one subject before downloading.";
        return;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("fpp subject selection", 20, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(
        `generated: ${new Date().toLocaleDateString("en-au")}`,
        20,
        35
    );

    let y = 50;

    selectedYears.sort((a, b) => Number(a) - Number(b));

    selectedYears.forEach(year => {
        if (y > 260) {
            doc.addPage();
            y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`year ${year}`, 20, y);
        y += 9;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        selectedSubjects[year].forEach(subjectName => {
            if (y > 275) {
                doc.addPage();
                y = 20;
            }

            doc.text(`- ${subjectName}`, 25, y);
            y += 7;
        });

        y += 7;
    });

    doc.save("fpp-subject-selection.pdf");

    document.getElementById("downloadMessage").textContent =
        "your subject selection pdf has been downloaded.";
});
