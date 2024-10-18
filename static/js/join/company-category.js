const categories = {
    서비스업: {
        "호텔·여행·항공": [
            { name: "호텔", code: "10803" },
            { name: "콘도", code: "10804" },
            { name: "카지노", code: "10805" },
            { name: "여행사", code: "10806" },
            { name: "항공사", code: "10807" },
            { name: "관광", code: "10813" },
            { name: "관광통역", code: "10814" },
            { name: "면세점", code: "10818" },
            { name: "유학·이민", code: "10819" },
        ],
        "외식업·식음료": [
            { name: "레스토랑", code: "20801" },
            { name: "패스트푸드", code: "20802" },
            { name: "카페", code: "20803" },
        ],
        "레저·스포츠·여가": [
            { name: "골프장", code: "30801" },
            { name: "테니스장", code: "30802" },
            { name: "수영장", code: "30803" },
        ],
    },
};

let selectedKeywords = [];
const MAX_KEYWORDS = 5;

const createHTMLStructure = () => {
    const listJobsCategory = document.querySelector(".list-jobs-category");
    const keywordDisplayArea = document.querySelector(".list-job-check ul");

    Object.keys(categories).forEach((mainCategory, index) => {
        // 대분류 생성
        let mainCategoryHTML = `
<li class="item-jobs-category">
    <div class="sub-depth">
        <strong class="title-sub-depth">
            <input type="hidden" id="mcode_${index}" name="mcode" value="${mainCategory}" data-mcode="${index}" />
            ${mainCategory}
        </strong>
        <div class="sub-depth2">
            <ul class="list-depth2">`;

        Object.keys(categories[mainCategory]).forEach(
            (subCategory, subIndex) => {
                // 중분류 생성 (화면에 표시)
                mainCategoryHTML += `
    <li class="item-depth2">
        <label class="sri-check small sri-radio" for="bcode_${subIndex}">
            <input type="radio" id="bcode_${subIndex}" name="bcode" class="inp-check" value="${subCategory}" data-mcode="${index}" data-bcode="${subIndex}" data-maincategory="${mainCategory}">
            <span class="txt-check txt-point">${subCategory}</span>
        </label>
    </li>`;
            }
        );

        mainCategoryHTML += `</ul></div><div class="sub-depth3" style="display: none;"></div></div></li>`;
        listJobsCategory.innerHTML += mainCategoryHTML;
    });

    // 중분류 클릭 시 소분류 표시 및 check-on 클래스 추가/제거
    document.querySelectorAll('input[name="bcode"]').forEach((radio) => {
        radio.addEventListener("change", (e) => {
            // 기존에 표시된 소분류 숨기기 및 초기화
            document.querySelectorAll(".sub-depth3").forEach((el) => {
                el.style.display = "none";
                el.innerHTML = ""; // 소분류 내용 제거
            });
            resetKeywords(); // 기존 키워드 초기화

            const label = e.target.closest(".sri-check");
            document
                .querySelectorAll(".sri-check.small.sri-radio")
                .forEach((el) => {
                    el.classList.remove("check-on");
                });
            label.classList.add("check-on"); // 중분류에 check-on 추가

            const subDepthElement = e.target
                .closest(".sub-depth")
                .querySelector(".sub-depth3");
            const selectedSubCategory = e.target.value;
            const mainCategory = e.target.getAttribute("data-maincategory");

            // 중분류 선택 시 대분류 > 중분류 형식으로 키워드 추가
            updateMainKeyword(mainCategory, selectedSubCategory);

            // 소분류 생성 및 표시
            if (categories[mainCategory][selectedSubCategory]) {
                let subCategoryHTML = `
        <strong class="title-sub-depth3">${mainCategory} > ${selectedSubCategory}</strong>
        <ul class="list-depth3">`;

                categories[mainCategory][selectedSubCategory].forEach(
                    (item) => {
                        subCategoryHTML += `
            <li class="item-depth3">
                <label class="sri-check small" for="code_${item.code}">
                    <input type="checkbox" id="code_${item.code}" name="code" class="inp-check" value="${item.name}" data-bcode="${item.code}">
                    <span class="txt-check txt-point">${item.name}</span>
                </label>
            </li>`;
                    }
                );

                subCategoryHTML += `</ul>`;
                subDepthElement.innerHTML = subCategoryHTML;
                subDepthElement.style.display = "block"; // 소분류 보이기

                // 소분류 클릭 시 check-on 추가/제거 및 키워드 추가
                document
                    .querySelectorAll('input[name="code"]')
                    .forEach((subCheckbox) => {
                        subCheckbox.addEventListener("change", (e) => {
                            const subLabel = e.target.closest(".sri-check");
                            const keyword = e.target.value;
                            const categoryLabel = `${mainCategory} > ${selectedSubCategory}`;

                            if (e.target.checked) {
                                if (selectedKeywords.length >= MAX_KEYWORDS) {
                                    alert(
                                        "키워드는 최대 5개까지 선택할 수 있습니다."
                                    );
                                    e.target.checked = false;
                                    return;
                                }
                                subLabel.classList.add("check-on");
                                addSubKeyword(keyword, categoryLabel);
                            } else {
                                subLabel.classList.remove("check-on");
                                removeSubKeyword(keyword); // 소분류만 삭제
                            }
                        });
                    });
            }
        });
    });

    // 중분류 키워드 업데이트 함수 (이미 있는 `box-task-hover`에 추가)
    const updateMainKeyword = (mainCategory, subCategory) => {
        let existingBox = document.querySelector(".box-task-hover");
        if (!existingBox) {
            // box-task-hover가 없으면 새로 생성
            const keywordItem = document.createElement("li");
            keywordItem.className = "item-check";
            keywordItem.innerHTML = `
    <div class="box-task-hover">
        <span class="hope-jobs" data-bcode="${subCategory}" style="color: rgb(86, 111, 235);">${mainCategory}&nbsp;&gt;&nbsp;${subCategory}&nbsp;
            <button type="button" class="btn-delete"><span class="blind">삭제</span></button>
        </span>
    </div>`;
            selectedKeywords.push(subCategory);
            keywordDisplayArea.appendChild(keywordItem);

            // 삭제 버튼 클릭 이벤트 추가
            keywordItem
                .querySelector(".btn-delete")
                .addEventListener("click", () => {
                    removeMainKeyword(subCategory);
                    keywordItem.remove();
                });
        } else {
            // 이미 존재하는 경우, 중분류를 업데이트
            const mainKeywordSpan = existingBox.querySelector(".hope-jobs");
            mainKeywordSpan.innerHTML = `${mainCategory}&nbsp;&gt;&nbsp;${subCategory}&nbsp;<button type="button" class="btn-delete"><span class="blind">삭제</span></button>`;

            // 중분류 삭제 버튼 이벤트 다시 추가
            mainKeywordSpan
                .querySelector(".btn-delete")
                .addEventListener("click", () => {
                    removeMainKeyword(subCategory);
                    existingBox.parentElement.remove();
                });
        }
    };

    // 소분류 키워드 추가 함수 (기존 `box-task-hover`에 추가)
    const addSubKeyword = (keyword, categoryLabel) => {
        const existingBox = document.querySelector(".box-task-hover");
        const subKeywordSpan = document.createElement("span");
        subKeywordSpan.className = "hope-jobs hope-depth";
        subKeywordSpan.innerHTML = `${keyword}&nbsp;<button type="button" class="btn-delete"><span class="blind">삭제</span></button>`;
        existingBox.appendChild(subKeywordSpan);

        // 삭제 버튼 클릭 이벤트 추가
        subKeywordSpan
            .querySelector(".btn-delete")
            .addEventListener("click", () => {
                removeSubKeyword(keyword);
                subKeywordSpan.remove(); // box-task-hover에서 해당 소분류 삭제
            });
    };

    // 중분류 삭제 함수
    const removeMainKeyword = (subCategory) => {
        selectedKeywords = selectedKeywords.filter((k) => k !== subCategory);
        resetKeywords(); // 중분류 삭제 시 소분류도 초기화
    };

    // 소분류 삭제 함수
    const removeSubKeyword = (keyword) => {
        selectedKeywords = selectedKeywords.filter((k) => k !== keyword);
        const inputElement = document.querySelector(
            `input[value="${keyword}"]`
        );
        if (inputElement) {
            inputElement.checked = false;
            inputElement.closest(".sri-check").classList.remove("check-on");
        }
    };

    // 키워드 초기화 함수
    const resetKeywords = () => {
        selectedKeywords = [];
        document.querySelector(".list-job-check ul").innerHTML = "";
    };
    // 키워드 삭제 함수
    const removeKeyword = (keyword, targetInput) => {
        selectedKeywords = selectedKeywords.filter((k) => k !== keyword);

        const keywordElement = document.querySelector(
            `span.hope-depth[data-code="${targetInput.getAttribute(
                "data-code"
            )}"]`
        );
        if (keywordElement) {
            keywordElement.remove();
        }

        if (
            !document.querySelector(
                `.hope-depth[data-bcode="${targetInput.getAttribute(
                    "data-bcode"
                )}"]`
            )
        ) {
            const bcodeElement = document.querySelector(
                `li[data-bcode="${targetInput.getAttribute("data-bcode")}"]`
            );
            if (bcodeElement) bcodeElement.remove();
        }

        targetInput.closest(".sri-check").classList.remove("check-on");
        targetInput.checked = false;
    };
};

// 처음 로드 시 카테고리 생성
createHTMLStructure();

// =========================버튼 동작===========================
// 닫기 버튼 클릭 시 레이어 숨기기
document.querySelectorAll(".btn-layer-close, .btn-close").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.getElementById("layer-desire-industry").style.display = "none";
    });
});

// 선택 버튼 클릭 시 레이어 보여주기
document.querySelector(".btn-job-category").addEventListener("click", () => {
    document.getElementById("layer-desire-industry").style.display = "block";
});

// 초기화 버튼 클릭 시 키워드 및 선택된 중분류/소분류 초기화
document.querySelector(".btn-reset").addEventListener("click", () => {
    selectedKeywords = [];
    document.querySelector(".list-job-check ul").innerHTML = "";
    document
        .querySelectorAll('input[name="bcode"], input[name="code"]')
        .forEach((input) => {
            input.checked = false;
            input.closest(".sri-check").classList.remove("check-on");
        });
});
