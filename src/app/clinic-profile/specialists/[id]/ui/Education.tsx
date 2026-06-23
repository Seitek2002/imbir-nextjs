import { FC } from "react";

import { IProps } from "../model/types";
import { inp, lbl } from "./constants";

export const Education: FC<IProps> = ({ isEditing, d, set }) => {
  return (
    <div className="p-8">
      <h3 className="text-foreground font-semibold text-lg mb-6">
        Образование
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        <div>
          {isEditing ? (
            <>
              <label className={lbl}>ВУЗ</label>
              <input
                type="text"
                value={d.university}
                onChange={(e) => set("university", e.target.value)}
                placeholder="Название учебного заведения"
                className={inp}
              />
            </>
          ) : (
            <>
              <div className="text-muted text-sm mb-1">ВУЗ</div>
              <div className="text-foreground text-base">
                {d.university || "—"}
              </div>
            </>
          )}
        </div>
        <div>
          {isEditing ? (
            <>
              <label className={lbl}>Год окончания</label>
              <input
                type="text"
                value={d.graduationYear}
                onChange={(e) => set("graduationYear", e.target.value)}
                placeholder="ГГГГ"
                className={inp}
              />
            </>
          ) : (
            <>
              <div className="text-muted text-sm mb-1">Год окончания</div>
              <div className="text-foreground text-base">
                {d.graduationYear || "—"}
              </div>
            </>
          )}
        </div>
        <div>
          {isEditing ? (
            <>
              <label className={lbl}>Интернатура</label>
              <input
                type="text"
                value={d.internship}
                onChange={(e) => set("internship", e.target.value)}
                placeholder="Специальность"
                className={inp}
              />
            </>
          ) : (
            <>
              <div className="text-muted text-sm mb-1">Интернатура</div>
              <div className="text-foreground text-base">
                {d.internship || "—"}
              </div>
            </>
          )}
        </div>
        <div>
          {isEditing ? (
            <>
              <label className={lbl}>Ординатура</label>
              <input
                type="text"
                value={d.residency}
                onChange={(e) => set("residency", e.target.value)}
                placeholder="Специальность"
                className={inp}
              />
            </>
          ) : (
            <>
              <div className="text-muted text-sm mb-1">Ординатура</div>
              <div className="text-foreground text-base">
                {d.residency || "—"}
              </div>
            </>
          )}
        </div>
        <div className="col-span-2">
          {isEditing ? (
            <>
              <label className={lbl}>Специализация по диплому</label>
              <input
                type="text"
                value={d.diplomaSpecialty}
                onChange={(e) => set("diplomaSpecialty", e.target.value)}
                placeholder="Введите специализацию"
                className={inp}
              />
            </>
          ) : (
            <>
              <div className="text-muted text-sm mb-1">
                Специализация по диплому
              </div>
              <div className="text-foreground text-base">
                {d.diplomaSpecialty || "—"}
              </div>
            </>
          )}
        </div>
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-muted text-sm">Дополнительное образование</div>
            {isEditing && (
              <button
                onClick={() =>
                  set("additionalEducation", [...d.additionalEducation, ""])
                }
                className="text-primary text-sm font-medium flex items-center gap-1 hover:text-primary-dark transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 2V12M2 7H12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Добавить
              </button>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-2">
              {d.additionalEducation.length === 0 ? (
                <div className="text-dim text-sm px-4 py-3 rounded-2xl border border-dashed border-border text-center">
                  Нажмите «Добавить» для добавления записи
                </div>
              ) : (
                d.additionalEducation.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        set(
                          "additionalEducation",
                          d.additionalEducation.map((v, j) =>
                            j === i ? e.target.value : v,
                          ),
                        )
                      }
                      placeholder="Курс, год"
                      className={`${inp} flex-1`}
                    />
                    <button
                      onClick={() =>
                        set(
                          "additionalEducation",
                          d.additionalEducation.filter((_, j) => j !== i),
                        )
                      }
                      className="w-9 h-9 flex items-center justify-center text-dim hover:text-primary transition-colors shrink-0"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M12 4L4 12M4 4L12 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-1 mt-1">
              {d.additionalEducation.length === 0 ? (
                <div className="text-foreground text-base">—</div>
              ) : (
                d.additionalEducation.map((item, i) => (
                  <div key={i} className="text-foreground text-base">
                    {item}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
