export const ToolButton = ({ founds, findings }) => {
  console.log("tooo founds", founds);
  console.log("toooo findings", findings);
  return (
    <>
      <div
        className={`relative w-full  shadow-lg ring-1 ring-gray-900/5 dark:bg-gray-800
        ${findings ? "bg-emerald-50" : "bg-rose-50"}`}
      >
        <div className="sticky top-0 flex items-center bg-gray-50/90 px-4 py-3 text-sm font-semibold text-gray-900 ring-1 ring-gray-900/10 backdrop-blur-sm">
          텍스트 블러/마스킹
        </div>
        <div className="flex flex-col p-1 divide-y text-sm divide-gray-200 dark:divide-gray-200/5">
          {/* --구분용 */}
          <div className="flex">
            <div className="group flex items-start justify-center w-full h-11 my-1 py-3 overflow-hidden transition-all duration-200 hover:h-20 hover:border-1 hover:border-slate-400 active:translate-x-1 active:translate-y-1">
              {" "}
              개인정보보호법 제17조: 개인정보 제3자 제공 시 동의 필요
              <div className="absolute left-3 transform translate-y-full opacity-0 text-gray-400 text-xs transition-all duration-300 group-hover:translate-y-5.5 group-hover:opacity-100">
                <span className="hidden group-hover:block">
                  정보주체의 동의를 받지 않은 상태에서 개인정보 식별 가능하다면
                  위법 소지 발생
                </span>
              </div>
            </div>
          </div>

          {/* --구분용 */}
          <div className="flex">
            <div className="group flex items-start justify-center w-full h-11 my-1 text-[13px] py-3 overflow-hidden transition-all duration-200 hover:h-20 hover:border-1 hover:border-slate-400 active:translate-x-1 active:translate-y-1">
              {" "}
              개인정보보호법 제24조의2: 고유식별정보(주민번호 등) 처리 제한
              <div className="absolute left-2 transform px-1 translate-y-full opacity-0 text-gray-400 text-xs transition-all duration-300 group-hover:translate-y-5.5 group-hover:opacity-100">
                <span className="hidden group-hover:block">
                  주민등록번호, 여권번호, 얼굴 이미지, 지문 등 고유식별정보는
                  법령 근거 없이는 수집·처리 금지
                </span>
              </div>
            </div>
          </div>

          {/* --구분용 */}
          <div className="flex">
            <div className="group flex items-start justify-center w-full h-11 my-1 py-3 overflow-hidden transition-all duration-200 hover:h-20 hover:border-1 hover:border-slate-400 active:translate-x-1 active:translate-y-1">
              {" "}
              개인정보보호법 제29조: 개인정보의 안전성 확보 조치 의무
              <div className="absolute left-3 transform px-1 translate-y-full opacity-0 text-gray-400 text-xs transition-all duration-300 group-hover:translate-y-5.5 group-hover:opacity-100">
                <span className="hidden group-hover:block">
                  개인정보처리자는 개인정보를 안전하게 관리하기 위해 암호화,
                  비식별화, 접근통제 등의 기술적/관리적 보호조치를 취해야 함
                </span>
              </div>
            </div>
          </div>

          {/* --구분용 */}
          <div className="flex">
            <div className="group flex items-start justify-center w-full h-11 my-1 py-3 overflow-hidden transition-all duration-200 hover:h-20 hover:border-1 hover:border-slate-400 active:translate-x-1 active:translate-y-1">
              {" "}
              행정안전부 「개인정보의 안전성 확보조치 기준(고시)」
              <div className="absolute transform p-1 translate-y-full opacity-0 text-gray-400 text-xs transition-all duration-300 group-hover:translate-y-5.5 group-hover:opacity-100">
                <span className="hidden group-hover:block">
                  OCR·DLP 적용 통한 비식별 조치 권장
                </span>
              </div>
            </div>
          </div>

          {/* --구분용 */}
          <div className="flex">
            <div className="group flex items-start justify-center w-full h-11 my-1 py-3 overflow-hidden transition-all duration-200 hover:h-20 hover:border-1 hover:border-slate-400 active:translate-x-1 active:translate-y-1">
              {" "}
              방송통신위원회 「개인정보 비식별조치 가이드라인」
              <div className="absolute p-1 transform translate-y-full opacity-0 text-gray-400 text-xs transition-all duration-300 group-hover:translate-y-5.5 group-hover:opacity-100">
                <span className="hidden group-hover:block">
                  이름·연락처 등은 마스킹, 대체처리 등으로 식별 가능성 제거 필요
                </span>
              </div>
            </div>
          </div>
          {/* --구분용 */}
        </div>
      </div>
      {/* ----얼 굴, 마 스 코 트 처 리---- */}
      <div
        className={`relative w-full  shadow-lg ring-1 ring-gray-900/5 dark:bg-gray-800
        ${founds ? "bg-emerald-50" : "bg-rose-50"}`}
      >
        <div className="sticky top-0 flex items-center bg-gray-50/90 px-4 py-3 text-sm font-semibold text-gray-900 ring-1 ring-gray-900/10 backdrop-blur-sm dark:bg-gray-700/90 dark:text-gray-200 dark:ring-black/10">
          얼굴 모자이크, 마스코트 처리
        </div>
        <div className="flex flex-col p-1 divide-y text-sm divide-gray-200 dark:divide-gray-200/5">
          {/* --구분용 */}
          <div className="flex">
            <div className="group flex items-start justify-center w-full h-11 my-1 py-3 overflow-hidden transition-all duration-200 hover:h-23 hover:border-1 hover:border-slate-400 active:translate-x-1 active:translate-y-1">
              {" "}
              개인정보보호법 제24조의2: 고유식별정보 처리 제한
              <div className="absolute left-3 px-1 transform translate-y-full opacity-0 text-gray-400 text-xs transition-all duration-300 group-hover:translate-y-5.5 group-hover:opacity-100">
                <span className="hidden group-hover:block">
                  <li>
                    얼굴 이미지는 생체정보로 분류되어, 법령 근거 없이 수집·처리
                    불가{" "}
                  </li>{" "}
                  <li>
                    AI가 자동 인식해 저장/분석할 경우 → 반드시 모자이크 또는
                    대체 처리 필요
                  </li>
                </span>
              </div>
            </div>
          </div>

          {/* --구분용 */}
          <div className="flex">
            <div className="group flex items-start justify-center w-full h-11 my-1 text-sm py-3 overflow-hidden transition-all duration-200 hover:h-20 hover:border-1 hover:border-slate-400 active:translate-x-1 active:translate-y-1">
              {" "}
              개인정보보호법 제29조: 개인정보의 안전성 확보 조치 의무
              <div className="absolute left-2 transform px-1 translate-y-full opacity-0 text-gray-400 text-xs transition-all duration-300 group-hover:translate-y-5.5 group-hover:opacity-100">
                <span className="hidden group-hover:block">
                  식별 가능한 얼굴은 기술적으로 모자이크/대체 처리해
                  비식별화해야 안전조치 의무를 이행한 것으로 간주됨
                </span>
              </div>
            </div>
          </div>

          {/* --구분용 */}
          <div className="flex">
            <div className="group flex items-start justify-center text-xs w-full h-11 my-1 py-3 overflow-hidden transition-all duration-200 hover:h-20 hover:border-1 hover:border-slate-400 active:translate-x-1 active:translate-y-1">
              {" "}
              개인정보보호법 제58조: 영상정보처리기기 운영 시 고지·최소 수집
              의무
              <div className="absolute left-2 transform px-1 translate-y-full opacity-0 text-gray-400 text-xs transition-all duration-300 group-hover:translate-y-5.5 group-hover:opacity-100">
                <span className="hidden group-hover:block">
                  영상에서 자동으로 수집되는 얼굴 정보는 최소 수집 원칙에 따라
                  불필요한 노출을 차단해야 함
                </span>
              </div>
            </div>
          </div>

          {/* --구분용 */}
          <div className="flex">
            <div className="group flex items-start justify-center w-full h-11 my-1 py-3 overflow-hidden transition-all duration-200 hover:h-20 hover:border-1 hover:border-slate-400 active:translate-x-1 active:translate-y-1">
              {" "}
              행정안전부 「개인정보의 안전성 확보조치 기준(고시)」
              <div className="absolute transform left-3 px-1 translate-y-full opacity-0 text-gray-400 text-xs transition-all duration-300 group-hover:translate-y-5.5 group-hover:opacity-100">
                <span className="hidden group-hover:block">
                  얼굴은 가장 우선적으로 비식별 조치 대상이며, 모자이크/대체
                  방식 권장
                </span>
              </div>
            </div>
          </div>

          {/* --구분용 */}
          <div className="flex">
            <div className="group flex items-start justify-center w-full h-11 my-1 py-3 overflow-hidden transition-all duration-200 hover:h-20 hover:border-1 hover:border-slate-400 active:translate-x-1 active:translate-y-1">
              {" "}
              방송통신위원회 「AI 이용 가이드라인」
              <div className="absolute left-3 p-1 transform translate-y-full opacity-0 text-gray-400 text-xs transition-all duration-300 group-hover:translate-y-5.5 group-hover:opacity-100">
                <span className="hidden group-hover:block">
                  AI가 얼굴을 자동 인식·분석하는 경우, 사생활 보호 원칙과
                  정보주체 고지 의무 준수 필요
                </span>
              </div>
            </div>
          </div>
          {/* --구분용 */}
        </div>
      </div>
      {/* ----구분용---- */}
      <div className="relative w-full bg-white shadow-lg ring-1 ring-gray-900/5 dark:bg-gray-800">
        <div className="sticky top-0 flex items-center bg-gray-50/90 px-4 py-3 text-sm font-semibold text-gray-900 ring-1 ring-gray-900/10 backdrop-blur-sm dark:bg-gray-700/90 dark:text-gray-200 dark:ring-black/10">
          사용자 직접 마스킹
        </div>
        <div className="flex flex-col p-1 divide-y text-sm divide-gray-200 dark:divide-gray-200/5">
          {/* --구분용 */}
          <div className="flex">
            <div className="group flex items-start justify-center w-full h-11 my-1 text-sm py-3 overflow-hidden transition-all duration-200 hover:h-20 hover:border-1 hover:border-slate-400 active:translate-x-1 active:translate-y-1">
              {" "}
              개인정보보호법 제29조: 개인정보의 안전성 확보 조치 의무
              <div className="absolute left-2 transform px-1 translate-y-full opacity-0 text-gray-400 text-xs transition-all duration-300 group-hover:translate-y-5.5 group-hover:opacity-100">
                <span className="hidden group-hover:block">
                  기술적 조치와 사용자 중심의 보호기능을 함께 제공하는 방식으로
                  법적 의무 이행 가능
                </span>
              </div>
            </div>
          </div>
          {/* --구분용 */}
          <div className="flex">
            <div className="group flex items-start justify-center w-full h-11 my-1 py-3 overflow-hidden transition-all duration-200 hover:h-23 hover:border-1 hover:border-slate-400 active:translate-x-1 active:translate-y-1">
              {" "}
              방송통신위원회 「개인정보 비식별조치 가이드라인」
              <div className="absolute left-3 transform translate-y-full opacity-0 text-gray-400 text-xs transition-all duration-300 group-hover:translate-y-5.5 group-hover:opacity-100">
                <span className="hidden group-hover:block">
                  <li>
                    사용자가 선택하여 마스킹하는 방식도 비식별화 방법 중 하나로
                    인정{" "}
                  </li>{" "}
                  <li>
                    특히 AI 추천과 사용자 직접 지정 기능이 결합된 방식은
                    효율적이고 권장됨
                  </li>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
