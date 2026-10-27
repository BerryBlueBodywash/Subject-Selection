let subjectData = {};
let selectedSubjects = {};   //for example it'd be like "8": ["History"], "9": ["English"] }

const yearSelect = document.getElementById("yearSelect");
const subjectsContainer = document.getElementById("subjects");
const selectedList = document.getElementById("selectedList"); 

fetch("./subjects.json")
    .then(response => response.json())
    .then(data => {
        subjectData = data;

        const years = Object.keys(subjectData);

       /* years.forEach(year => {
            const option = document.createElement("option");

            option.value = year;
            option.textContent = `Year ${year}`;

            yearSelect.appendChild(option);
        });*/
    });
    

function isSelected(year, name) { //this stuff is because the years arean't label 'years' but just the first line of the
    return selectedSubjects[year] && selectedSubjects[year].includes(name);
}

yearSelect.addEventListener("change", () => {

    const selectedYear = yearSelect.value;
    subjectsContainer.innerHTML = ""; //starts off empty

    if (!selectedYear) {
        return;
    }

    const subjects = subjectData[selectedYear].subjects;

    //card for every subject
    subjects.forEach(subject => {

        const subjectCard = document.createElement("div");
        subjectCard.classList.add("subject-card");

        //put in the heading
        const subjectHeader = document.createElement("button");
        subjectHeader.classList.add("subject-header");

        subjectHeader.textContent = subject.name;

        //put in hte information
        const subjectInfo = document.createElement("div");
        subjectInfo.classList.add("subject-info");

        //put in the description (all of these are taken from the json)
        const description = document.createElement("p");

        //if its empty show that it's empty
        description.innerHTML = `
            <strong>Description:</strong>
            ${subject.description || "No description available. Conact your mentor group teacher, the subject leader, of subschool leader for more information"}
        `;

        subjectInfo.appendChild(description);

        //prerequisites 
        const prereqs = document.createElement("p");

        let prereqText;

        if (subject.prereqs && subject.prereqs.length > 0) {
            prereqText = subject.prereqs.join(", "); //join them with a , considering its all tags [why tho if we're not tracking the old one?]
        } else {
            prereqText = "None";
        }

        prereqs.innerHTML = `
            <strong>Prerequisites:</strong>
            ${prereqText}
        `;

        subjectInfo.appendChild(prereqs);

        //time
        const time = document.createElement("p");

        time.innerHTML = `
            <strong>Time:</strong>
            ${subject.time || "Not specified"}
        `;

        subjectInfo.appendChild(time);


//the part with he checkbox and name
const subjectRow = document.createElement("div");
subjectRow.classList.add("subject-row");

const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.classList.add("subject-checkbox");
checkbox.checked = isSelected(selectedYear, subject.name);  //conditions for it to be checked here

checkbox.addEventListener("change", () => {
    toggleSubject(selectedYear, subject.name, checkbox.checked); //this is what checks if it is selected!! 
});

//putting that stuff into the row thing (pretty sure it can be simplified by a lot but wtv)
subjectRow.appendChild(checkbox);
subjectRow.appendChild(subjectHeader);

subjectCard.appendChild(subjectRow);
subjectCard.appendChild(subjectInfo);

        subjectsContainer.appendChild(subjectCard);


        //the exapnd/hidden thing 
        subjectHeader.addEventListener("click", () => {

            subjectCard.classList.toggle("expanded");

        });

    });

});

document.getElementById("downloadPDF").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();


    const selectedYears = Object.keys(selectedSubjects).filter(
        year => selectedSubjects[year]?.length > 0
    );

    if (selectedYears.length === 0) {
        document.getElementById("downloadMessage").textContent =
            "Please select at least one subject before downloading.";
        return;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("FPP Subject Selection", 20, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(
        `Generated: ${new Date().toLocaleDateString("en-AU")}`,
        20,
        35
    );

    let y = 50;

    // sirting subhects into year levels
    selectedYears.sort((a, b) => Number(a) - Number(b));

    selectedYears.forEach(year => {
        if (y > 260) {
            doc.addPage();
            y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`Year ${year}`, 20, y);
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

    // Download the PDF
    doc.save("FPP-Subject-Selection.pdf");

    document.getElementById("downloadMessage").textContent =
        "Your subject selection PDF has been downloaded.";
});

