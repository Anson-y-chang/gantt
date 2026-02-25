<template>
  <div
    class="h-12 flex list-row group"
    :class="{
      '!bg-primary-50': isSelected,
      'bg-secondary': atMiddle,
      'border-primary': atBottom || atTop,
      'bg-slate-100/50': data.isHovered,
    }"
    @dragenter="dragenter"
    @dragover="dragover"
    @drop="drop"
    @mouseenter="currentData.isHovered = true"
    @mouseleave="currentData.isHovered = false"
  >
    <!-- order -->
    <div v-if="store.viewSetting.order" class="w-[41px] !justify-center">
      {{ store.projectSequence.findIndex((el) => el.id == data.id) + 1 }}
    </div>
    <!-- note -->
    <div class="w-[69px]"></div>
    <!-- name -->
    <div
      class="relative grow w-0"
      :style="{ paddingLeft: 24 + 12 * (trace.length - 1) + 'px' }"
    >
      <div class="w-full overflow-hidden">
        <button
          class="group-hover:block hidden w-4 absolute left-1 cursor-grab"
          :class="{ sectionHandle: isSection, handle: !isSection }"
          style="top: 15.5px"
          @mousedown="enableDrag"
          @dragstart.prevent
        >
          <svg width="16" height="16">
            <!-- First Column -->
            <circle cx="5" cy="3" r="1.5" fill="#64748b" />
            <circle cx="5" cy="8" r="1.5" fill="#64748b" />
            <circle cx="5" cy="13" r="1.5" fill="#64748b" />
            <!-- Second Column -->
            <circle cx="11" cy="3" r="1.5" fill="#64748b" />
            <circle cx="11" cy="8" r="1.5" fill="#64748b" />
            <circle cx="11" cy="13" r="1.5" fill="#64748b" />
          </svg>
        </button>
        <div class="grow flex gap-1 items-center">
          <!-- expand and collapse -->
          <button
            class="w-4 h-4 shrink-0 mr-1"
            :class="{
              'pointer-events-none': (data as Section | Task).tasks.length == 0
            }"
            @click="collapse"
          >
            <template v-if="!isMilestone">
              <img
                v-show="(data as Section | Task).tasks.length && !editingName"
                :src="collapseIcon"
                alt="darg"
                :class="{ 'rotate-90': !(data as Section | Task).is_collapsed && dragCollapse }"
              />
            </template>
          </button>
          <!-- wbs -->
          <div v-if="store.viewSetting.wbs">
            {{ trace.map((el) => Number(el) + 1).join(".") }}
          </div>
          <!-- name -->
          <EditableCell
            :data
            :rowIndex
            :editingName
            :isSelected
            :isMilestone
            @rename="rename"
            @addTask="addTask"
            @deleteRow="deleteRow(false)"
            @updateTaskName="
              updateTaskAPI(store.project.id, data.id, { name: data.name })
            "
            @createTask="
              (afterId) => {
                if (data.type == 'section') {
                  createTaskAPI(store.project.id, {
                    parent_id,
                    type: data.type,
                    name: data.name,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    after: afterId,
                  });
                } else {
                  createTaskAPI(store.project.id, {
                    parent_id,
                    type: data.type,
                    name: data.name,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    after: afterId,
                    subsequences: data.subsequences,
                  });
                }
              }
            "
          ></EditableCell>
          <!-- setting -->
          <Button
            v-show="!editingName && !store.filterSelf"
            @click="upgrade"
            :disabled="trace.length < 3"
            class="hidden w-6 h-6 shrink-0 group-hover:flex justify-center rounded-full hover:bg-dark-200 translate-x-[0.75px]"
            :class="{ '!flex': isSelected }"
          >
            <img
              :src="collapseIcon"
              alt="darg"
              class="rotate-180 -translate-x-[0.75px]"
            />
          </Button>
          <Button
            v-show="!editingName && !store.filterSelf"
            @click="downgrade"
            :disabled="Number(trace[trace.length - 1]) === 0 || isSection"
            class="hidden w-6 h-6 shrink-0 group-hover:flex justify-center rounded-full hover:bg-dark-200 -translate-x-[0.75px]"
            :class="{ '!flex': isSelected }"
          >
            <img :src="collapseIcon" alt="darg" class="translate-x-[0.75px]" />
          </Button>
          <Button
            v-show="!editingName"
            @click="openSidePanel"
            class="hidden w-6 h-6 shrink-0 group-hover:flex justify-center rounded-full hover:bg-dark-200"
            :class="{ '!flex justify-center': isSelected }"
          >
            <img :src="searchIcon" alt="darg" class="w-4" />
          </Button>
          <Sidebar
            v-model:visible="showSidePanel"
            position="right"
            pt:root:class="w-[432px]"
            pt:header:class="p-6"
            pt:content:class="px-9 pb-9"
          >
            <template #header>
              <input
                :value="data.name"
                @blur="
                  (event) => {
                    const target = event.target as HTMLInputElement;
                    currentData.name = target.value;
                    updateTaskAPI(store.project.id, data.id, { name: data.name });
                  }
                "
                type="text"
                class="p-2 flex-1 w-0 text-3xl font-bold border border-transparent rounded hover:border-primary"
              />
            </template>
            <div class="flex flex-col gap-10">
              <!-- 完成率 -->
              <div class="flex items-center">
                <div class="text-tertiary w-28">完成率</div>
                <div v-if="ownTasks" class="p-1 text-tertiary">
                  {{
                    typeof data.finished_percentage === "object"
                      ? data.finished_percentage.totalDays
                        ? Math.round(
                            data.finished_percentage.completedDays /
                              data.finished_percentage.totalDays
                          ) + "%"
                        : "0%"
                      : ""
                  }}
                </div>
                <input
                  v-else-if="isMilestone"
                  type="checkbox"
                  class="ml-1 cursor-pointer"
                  v-model="inputBoolean"
                  @change="updateCompletion"
                />
                <input
                  v-else
                  type="text"
                  class="w-[3.1rem] h-6 p-1 bg-transparent border border-transparent outline-none rounded hover:border-light hover:bg-white focus:border-primary focus:bg-white"
                  :class="{
                    'hover:!border-primary': isSelected,
                  }"
                  v-model="inputValue"
                  @focus="selectContent"
                  @blur="updateCompletion"
                  @keydown.enter="blur"
                  @keydown.esc="blur"
                />
              </div>
              <!-- 任務日期 -->
              <div class="flex">
                <div class="text-tertiary w-28">任務日期</div>
                <div v-if="ownTasks" class="text-tertiary">
                  {{
                    props.data.start_date?.toLocaleDateString("zh-TW", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    }) || ""
                  }}
                </div>
                <Calendar
                  v-else-if="!isMilestone"
                  v-model="dateArray"
                  dateFormat="yy/mm/dd"
                  class="sm-calendar"
                  :manualInput="false"
                  selectionMode="range"
                  @update:modelValue="setDateArray"
                  placeholder="選擇日期"
                  :minDate="store.dateRange.start_date"
                  :maxDate="store.dateRange.end_date"
                  pt:root:class="h-4/5"
                  pt:input:class="px-1 shadow-none bg-transparent outline-none text-base"
                  pt:panel:class="border shadow-sm"
                  pt:header:class="border-b"
                  pt:monthTitle:class="mr-4"
                >
                </Calendar>
                <Calendar
                  v-else
                  v-model="currentData.start_date"
                  @update:modelValue="
                    () => {
                      currentData.start_date = localToUTC(currentData.start_date as Date);
                      updateTaskAPI(store.project.id, data.id, {
                        start_date: currentData.start_date
                      });
                    }
                  "
                  dateFormat="yy/mm/dd"
                  class="sm-calendar"
                  :manualInput="false"
                  :minDate="store.dateRange.start_date"
                  :maxDate="store.dateRange.end_date"
                  pt:root:class="h-4/5"
                  pt:input:class="px-1 shadow-none bg-transparent outline-none text-base"
                  pt:panel:class="border shadow-sm"
                  pt:header:class="border-b"
                  pt:monthTitle:class="mr-4"
                  placeholder="選擇日期"
                >
                </Calendar>
              </div>
              <!-- 成員 -->
              <template v-if="!isSection">
                <div class="flex">
                  <div class="text-tertiary w-28">成員</div>
                  <template
                    v-if="memberList.filter((el) => el.isSelected).length > 0"
                  >
                    <Avatar
                      v-for="member in memberList
                        .filter((el) => el.isSelected)
                        .slice(0, 5)"
                      :key="member.employee_id"
                      :label="member.name.substring(0, 1)"
                      class="mr-1 bg-[#0C8DC0] text-white"
                      shape="circle"
                      :pt="{ root: { class: ['w-6 h-6 text-sm'] } }"
                    />
                    <Avatar
                      v-if="memberList.filter((el) => el.isSelected).length > 5"
                      :label="`+${
                        memberList.filter((el) => el.isSelected).length - 5
                      }`"
                      class="mr-1 bg-grey-500 text-white"
                      shape="circle"
                      :pt="{ root: { class: ['w-6 h-6 text-sm'] } }"
                    />
                  </template>
                  <Button
                    v-if="!ownTasks && !isMilestone"
                    class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-dark-200"
                    @click="openMemberPanel"
                  >
                    <img
                      :src="addMemberIcon"
                      alt="add-member"
                      class="translate-x-[0.75px]"
                    />
                  </Button>
                </div>
              </template>
              <!-- 依存項 -->
              <div v-if="!ownTasks" class="flex items-top">
                <div class="text-tertiary w-28 h-10 py-2">依存項</div>
                <div class="flex flex-col gap-3 grow">
                  <div
                    v-for="(subsequence, index) in (data as Task | Milestone).subsequences"
                    :key="subsequence"
                    class="flex gap-2 items-center"
                  >
                    <Dropdown
                      v-model="(currentData as Task | Milestone).subsequences[index]"
                      @update:modelValue="
                        updateTaskAPI(store.project.id, props.data.id, {
                          subsequences: (data as Task | Milestone).subsequences,
                        })
                      "
                      placeholder="選擇任務"
                      :options="
                        store.projectSequence.filter((el) => !el.ownTasks)
                      "
                      optionLabel="name"
                      optionValue="id"
                      :optionDisabled="
                        (option) =>
                          [
                            ...(data as Task | Milestone).subsequences.slice(0, index),
                            ...(data as Task | Milestone).subsequences.slice(index + 1),
                            data.id
                          ].includes(option.id)
                      "
                      class="border border-light grow max-w-[175px]"
                      pt:filterInput:class="border"
                      filter
                    >
                    </Dropdown>
                    <Button
                      class="hover:bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center"
                      @click="deleteSubsequence(index)"
                    >
                      <img :src="deleteIcon" alt="delete" />
                    </Button>
                  </div>
                  <Button
                    class="hover:bg-slate-200 px-1 flex gap-1 w-fit"
                    @click="addSubsequence"
                  >
                    <span class="text-xl -translate-y-[1px]">+</span>
                    <span class="leading-9">新增依存項</span>
                  </Button>
                </div>
              </div>
              <!-- 任務敘述 -->
              <div>
                <div class="text-tertiary w-28 mb-3">任務敘述</div>
                <textarea
                  v-model="currentData.description"
                  @blur="updateDescription"
                  class="p-2 w-full min-h-20 rounded-md border border-light outline-none"
                  placeholder="請輸入任務敘述"
                ></textarea>
              </div>
              <!-- 待辦清單 -->
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <div class="text-tertiary">待辦清單</div>
                  <div class="px-1 py-1.5 flex items-center gap-1">
                    <img
                      :src="list2Icon"
                      alt="view2"
                      class="inline-block w-4"
                    />
                    <span>{{
                      props.data.todos.filter((todo) => todo.isFinished)
                        .length +
                      "/" +
                      props.data.todos.length
                    }}</span>
                  </div>
                  <Button
                    class="px-1 py-1.5 flex items-center gap-1 hover:bg-slate-200"
                    @click="hiddenFinishedTodos = !hiddenFinishedTodos"
                  >
                    <img
                      v-show="!hiddenFinishedTodos"
                      :src="unviewIcon"
                      alt="unview2"
                      class="inline-block w-6"
                    />
                    <img
                      v-show="hiddenFinishedTodos"
                      :src="view2Icon"
                      alt="view2"
                      class="inline-block w-6 scale-110 translate-x-[0.5px]"
                    />
                    <span>{{
                      hiddenFinishedTodos ? "顯示完成項目" : "隱藏完成項目"
                    }}</span>
                  </Button>
                </div>
                <draggable
                  :list="props.data.todos"
                  v-bind="{
                    animation: 200,
                    group: 'sections',
                    disabled: false,
                  }"
                  @start="dragTodo = true"
                  @end="dragTodo = false"
                  item-key="1"
                  class="flex flex-col gap-2"
                >
                  <template #item="{ element, index }">
                    <div
                      v-show="!hiddenFinishedTodos || !element.isFinished"
                      class="px-1 h-8 flex flex-row items-center gap-3 rounded-md group/todo"
                      :class="{ 'hover:bg-slate-100': !dragTodo }"
                      @dragstart="dragTodoStart"
                    >
                      <input
                        v-model="element.isFinished"
                        type="checkbox"
                        class="cursor-pointer scale-[1.2]"
                      />
                      <input
                        :id="`${element.id}`"
                        :value="element.value"
                        @blur="
                          (e) => {
                            const target = e.target as HTMLInputElement;
                            element.value = target.value;
                          }
                        "
                        type="text"
                        class="h-7 flex-1 border-b bg-transparent"
                        :class="{ 'line-through': element.isFinished }"
                        @keydown.enter="addTodoWhileNotEmpty($event, index)"
                        autocomplete="off"
                      />
                      <Button
                        @click="deleteTodo(index)"
                        class="p-1 flex gap-1 opacity-0 group-hover/todo:opacity-100"
                      >
                        <img :src="deleteIcon" alt="" class="w-5" />
                      </Button>
                    </div>
                  </template>
                </draggable>
                <Button
                  class="p-1 hover:bg-slate-100 flex gap-3"
                  @click="addTodo(undefined, $event)"
                >
                  <div
                    class="w-3 aspect-square border-[1.2px] border-gray-400 rounded-[2.2px] scale-125 translate-x-[0.2px]"
                  ></div>
                  <span class="flex-1 text-left text-tertiary">新增項目</span>
                </Button>
              </div>
              <!-- 相關檔案 -->
              <div>
                <div class="text-tertiary mb-1">相關檔案</div>
                <div
                  class="h-[50px] border border-black border-dashed flex items-center justify-center rounded-md mb-1 cursor-pointer"
                  @dragenter="dragFilesEnter"
                  @dragover.prevent
                  @drop="uploadDroppedFiles"
                >
                  + 將檔案拖放至此或點擊上傳
                </div>
                <input
                  class="hidden"
                  type="file"
                  ref="fileInputOne"
                  multiple
                  accept="*/*"
                />
                <div class="text-sm">檔案大小限制: 10MB</div>
                <!-- 檔案區 -->
                <div class="mt-4 flex flex-col gap-2">
                  <template
                    v-for="(comment, commentIndex) in discussion"
                    :key="comment.id"
                  >
                    <div
                      v-for="(file, fileIndex) in comment.files"
                      :key="file.id"
                      class="flex gap-2 justify-between items-center group"
                    >
                      <img :src="imageIcon" alt="image" class="w-4" />
                      <a
                        :href="file.real_path"
                        :download="file.name"
                        v-tooltip.bottom="file.name"
                        class="flex-1 truncate leading-6 translate-y-[0.5px] cursor-pointer hover:underline"
                      >
                        {{ file.name }}
                      </a>
                      <!-- v-if="authStore.currentEmployeeId == comment.commented_by" -->
                      <Button
                        v-if="true"
                        class="w-6 h-6 hidden items-center justify-center group-hover:flex hover:bg-slate-200"
                        @click="
                          deleteFileAPI(
                            comment.id,
                            commentIndex,
                            file.id,
                            fileIndex
                          )
                        "
                      >
                        <img :src="deleteIcon" alt="delete" class="w-[18px]" />
                      </Button>
                    </div>
                  </template>
                </div>
              </div>
              <!-- 討論區 -->
              <div>
                <div class="text-tertiary mb-2">討論</div>
                <div v-if="!discussion.length" class="text-tertiary">
                  暫無討論
                </div>
                <div v-else class="flex flex-col gap-3">
                  <Card
                    v-for="(comment, commentIndex) in discussion"
                    :key="comment.id"
                    class="hover:bg-primary-50 group/comment"
                  >
                    <template #title>
                      <div class="h-8 flex items-center justify-between">
                        <div class="flex items-center justify-between gap-3">
                          <span>
                            {{
                              members.find(
                                (el) => el.employee_id == comment.commented_by
                              )?.name
                            }}
                          </span>
                          <span class="text-sm text-tertiary font-normal">
                            {{ formatTime(comment.updated_at) }}
                          </span>
                        </div>
                        <!-- v-if="authStore.currentEmployeeId == comment.commented_by" -->
                        <div
                          v-if="true"
                          class="flex items-center justify-between gap-1"
                        >
                          <template v-if="!comment.isEditing">
                            <Button
                              @click="comment.isEditing = true"
                              class="w-8 h-8 items-center justify-center hover:bg-primary-200 hidden group-hover/comment:flex"
                            >
                              <img :src="editIcon" alt="edit" />
                            </Button>
                            <Button
                              class="w-8 h-8 items-center justify-center hover:bg-primary-200 hidden group-hover/comment:flex"
                              @click="
                                deleteCommentAPI(comment.id, commentIndex)
                              "
                            >
                              <img :src="deleteIcon" alt="delete" />
                            </Button>
                          </template>
                          <template v-else>
                            <Button
                              @click="comment.isEditing = false"
                              class="w-8 h-8 items-center justify-center hover:bg-primary-200 hidden group-hover/comment:flex"
                            >
                              <img :src="closeIcon" alt="close" />
                            </Button>
                            <Button
                              class="w-8 h-8 items-center justify-center hover:bg-primary-200 hidden group-hover/comment:flex"
                              @click="
                                editCommentAPI(comment.id, comment.content);
                                comment.isEditing = false;
                              "
                            >
                              <img :src="checkIcon" alt="check" />
                            </Button>
                          </template>
                        </div>
                      </div>
                    </template>
                    <template #content>
                      <div v-if="!comment.isEditing" class="m-0">
                        {{ comment.content }}
                      </div>
                      <textarea
                        v-else
                        v-model="comment.content"
                        class="p-2 w-full min-h-20 rounded-md border border-light outline-none"
                      >
                      </textarea>
                      <div class="mt-5 flex flex-col gap-2">
                        <div
                          v-for="(file, fileIndex) in comment.files"
                          :key="file.id"
                          class="flex gap-2 justify-between items-center"
                        >
                          <img :src="imageIcon" alt="image" class="w-4" />
                          <a
                            :href="file.real_path"
                            :download="file.name"
                            v-tooltip.bottom="file.name"
                            class="flex-1 truncate leading-6 translate-y-[0.5px] cursor-pointer hover:underline"
                          >
                            {{ file.name }}
                          </a>
                          <!-- v-if="
                              authStore.currentEmployeeId ==
                                comment.commented_by && comment.isEditing
                            " -->
                          <Button
                            v-if="true"
                            class="w-6 h-6 flex items-center justify-center hover:bg-primary-200"
                            @click="
                              deleteFileAPI(
                                comment.id,
                                commentIndex,
                                file.id,
                                fileIndex
                              )
                            "
                          >
                            <img
                              :src="deleteIcon"
                              alt="delete"
                              class="block w-5"
                            />
                          </Button>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
                <hr class="my-4" />
                <div
                  class="p-2 border border-light rounded-md flex flex-col gap-2 justify-between"
                >
                  <textarea
                    v-model="commentContent"
                    class="min-h-[55px] resize-none outline-none overflow-hidden"
                    placeholder="新增討論"
                    @input="adjustHeight"
                  ></textarea>
                  <div class="flex flex-col gap-1">
                    <div
                      v-for="(file, index) in fileList"
                      :key="index"
                      class="flex gap-2 justify-between items-center"
                    >
                      <img :src="imageIcon" alt="image" class="ml-1 w-4" />
                      <div
                        class="flex-1 truncate leading-6 translate-y-[0.5px]"
                      >
                        {{ file.name }}
                      </div>
                      <Button
                        class="mr-1 w-[18px] hover:bg-slate-200"
                        @click="fileList.splice(index, 1)"
                      >
                        <img :src="closeIcon" alt="close" />
                      </Button>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <Button @click="selectFile">
                      <img
                        :src="attachedIcon"
                        alt="attachment"
                        class="scale-95"
                      />
                    </Button>
                    <Button
                      label="送出"
                      class="px-2 py-1 bg-primary text-white hover:bg-primary-hover"
                      @click="sendMessage"
                    ></Button>
                  </div>
                </div>
                <input
                  class="hidden"
                  type="file"
                  ref="fileInputTwo"
                  multiple
                  accept="*/*"
                  @change="saveFilesToFileList"
                />
              </div>
            </div>
          </Sidebar>
          <Button
            v-show="!editingName && !store.filterSelf"
            class="hidden w-6 h-6 shrink-0 group-hover:flex justify-center rounded-full hover:bg-dark-200"
            @click="openSetting"
            :class="{ '!flex justify-center': isSelected }"
          >
            <img :src="ellipsisIcon" alt="darg" class="-translate-y-[1px]" />
          </Button>
          <OverlayPanel
            ref="opSetting"
            :pt="{
              root: { class: ['border w-32 shadow-sm'] },
              content: { style: { padding: '0px' } },
            }"
          >
            <div class="flex flex-col w-25rem">
              <div
                class="px-3 py-2 border-b hover:bg-primary-200 cursor-pointer"
                @click="addTask"
              >
                新增任務
              </div>
              <div
                v-if="!isSection && !isMilestone"
                class="px-3 py-2 border-b hover:bg-primary-200 cursor-pointer"
                @click="addSubtask"
              >
                新增子任務
              </div>
              <div
                class="px-3 py-2 border-b hover:bg-primary-200 cursor-pointer"
                @click="addMilestone"
              >
                新增里程碑
              </div>
              <div
                v-if="!isSection && !isMilestone && !ownTasks"
                class="px-3 py-2 border-b hover:bg-primary-200 cursor-pointer"
                @click="turnTaskIntoMilestone"
              >
                轉換成里程碑
              </div>
              <div
                class="px-3 py-2 border-b hover:bg-primary-200 cursor-pointer"
                @click="rename(true)"
              >
                重新命名
              </div>
              <div
                class="px-3 py-2 border-b hover:bg-primary-200 cursor-pointer"
                @click="copyRow"
              >
                複製
              </div>
              <div
                class="px-3 py-2 hover:bg-primary-200 cursor-pointer text-danger"
                @click="
                  () => {
                    deleteRow();
                    deleteTaskAPI();
                  }
                "
              >
                刪除
              </div>
            </div>
          </OverlayPanel>
        </div>
      </div>
    </div>
    <!-- start_date -->
    <div class="w-[107px]">
      <div v-if="ownTasks" class="text-tertiary">
        {{
          props.data.start_date?.toLocaleDateString("zh-TW", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }) || ""
        }}
      </div>
      <Calendar
        v-else
        v-model="currentData.start_date"
        @update:modelValue="
          () => {
            currentData.start_date = localToUTC(currentData.start_date as Date);
            updateTaskAPI(store.project.id, data.id, { start_date: currentData.start_date });
          }
        "
        dateFormat="yy/mm/dd"
        class="sm-calendar"
        :manualInput="false"
        :maxDate="props.data.end_date || store.dateRange.end_date"
        :minDate="store.dateRange.start_date"
        pt:root:class="h-4/5"
        pt:input:class="shadow-none bg-transparent outline-none text-sm"
        pt:panel:class="border shadow-sm"
        pt:header:class="border-b"
        pt:monthTitle:class="mr-4"
        placeholder="選擇日期"
      ></Calendar>
    </div>
    <!-- end_date -->
    <div class="w-[107px]">
      <div v-if="ownTasks || isMilestone" class="text-tertiary">
        {{
          props.data.end_date?.toLocaleDateString("zh-TW", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }) || ""
        }}
      </div>
      <Calendar
        v-else
        v-model="currentData.end_date"
        @update:modelValue="
          () => {
            currentData.end_date = localToUTC(currentData.end_date as Date);
            updateTaskAPI(store.project.id, data.id, { end_date: currentData.end_date });
          }
        "
        dateFormat="yy/mm/dd"
        class="sm-calendar"
        :manualInput="false"
        :minDate="props.data.start_date || store.dateRange.start_date"
        :maxDate="store.dateRange.end_date"
        pt:root:class="h-4/5"
        pt:input:class="shadow-none bg-transparent outline-none text-sm"
        pt:panel:class="border shadow-sm"
        pt:header:class="border-b"
        pt:monthTitle:class="mr-4"
        placeholder="選擇日期"
      ></Calendar>
    </div>
    <!-- duration -->
    <div class="w-[86px]" :class="{ 'text-tertiary': ownTasks }">
      {{ data.duration_in_days ? data.duration_in_days + "天" : "" }}
    </div>
    <!-- assignees -->
    <div class="w-[107px]">
      <template
        v-if="memberList.filter((el) => el.isSelected).length > 0 && !ownTasks"
      >
        <Avatar
          :label="memberList.filter((el) => el.isSelected)[0].name.slice(0, 1)"
          class="mr-1 bg-[#0C8DC0] text-white"
          shape="circle"
          :pt="{ root: { class: ['w-6 h-6 text-sm'] } }"
        />
        <Avatar
          v-if="memberList.filter((el) => el.isSelected).length > 1"
          :label="`+${memberList.filter((el) => el.isSelected).length - 1}`"
          class="mr-1 bg-grey-500 text-white"
          shape="circle"
          :pt="{ root: { class: ['w-6 h-6 text-sm'] } }"
        />
      </template>
      <Button
        v-if="!ownTasks && !isMilestone"
        class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-dark-200"
        @click="openMemberPanel"
      >
        <img
          :src="addMemberIcon"
          alt="add-member"
          class="translate-x-[0.75px]"
        />
      </Button>
      <OverlayPanel
        showCloseIcon
        ref="opMember"
        :pt="{
          root: {
            class: [
              'border w-[306px] h-[300px] shadow-sm text-sm overflow-hidden',
            ],
          },
          content: { style: { padding: '0px' }, class: ['relative'] },
          closeButton: {
            class: [
              'scale-[0.875] -translate-x-0.5 translate-y-[2px] outline-none z-10 hover:bg-primary-200',
            ],
          },
        }"
        @hide="slideIn = false"
      >
        <!-- main -->
        <div>
          <!-- header -->
          <div class="h-[42px] border-b px-3 flex">
            <div class="flex items-center gap-4">
              <img :src="searchIcon" alt="darg" class="w-4" />
              <input
                type="text"
                class="outline-none w-[210px]"
                placeholder="搜尋成員"
              />
            </div>
          </div>
          <!-- option -->
          <div class="w-[305px] h-9 border-b flex items-center px-3.5 fixed">
            <input
              type="checkbox"
              class="cursor-pointer"
              @change="selectAllMembers"
            />
          </div>
          <ScrollPanel
            class="mt-9 h-[180px] relative text-sm"
            :pt="{
              barY: { class: ['bg-slate-500 rounded-full -translate-x-0.5'] },
            }"
          >
            <label
              v-for="member in memberList"
              class="h-9 border-b flex items-center px-3.5 gap-3 cursor-pointer hover:bg-primary-50"
              :key="member.employee_id"
            >
              <input
                v-model="member.isSelected"
                type="checkbox"
                class="cursor-pointer"
              />
              <div>{{ member.department }}</div>
              <div>{{ member.name }}</div>
            </label>
          </ScrollPanel>
          <!-- footer -->
          <div class="h-[42px] flex items-center justify-end px-2">
            <Button
              class="px-1 py-1 hover:bg-primary-200 hidden"
              @click="slideIn = true"
            >
              <img
                :src="addIcon"
                alt="add_task"
                class="inline-block mr-2 w-4"
              />
              <span>新增專案成員</span>
            </Button>
            <Button
              class="px-2 py-1 bg-primary text-white hover:bg-primary-hover"
              @click="saveMember"
            >
              儲存
            </Button>
          </div>
        </div>
        <!-- slideIn -->
        <div
          class="absolute top-0 left-0 transition w-full h-full bg-white z-10"
          :class="{ 'translate-x-full': !slideIn, 'translate-x-0': slideIn }"
        >
          <!-- header -->
          <div class="h-[42px] border-b px-3 flex items-center">
            <Button
              @click="slideIn = false"
              class="h-[28px] px-1 py-1 hover:bg-primary-200"
            >
              <img class="w-[16px] mr-2" :src="returnIcon" alt="" />
              <span>返回</span>
            </Button>
          </div>
          <!-- main -->
          <ScrollPanel
            class="h-[216px] border-b text-sm"
            pt:wrapper:class="px-2.5"
            pt:barY:class="bg-slate-500 rounded-full -translate-x-0.5"
          >
            <div class="pl-2 h-12 flex items-center gap-3">
              <span>1</span>
              <Dropdown
                placeholder="選擇成員"
                class="border border-light"
                pt:input:class="text-sm pr-0 pl-2 py-1.5"
                pt:trigger:class="scale-[0.8] w-8"
                pt:panel:class="text-sm"
              ></Dropdown>
              <Dropdown
                :disabled="true"
                placeholder="選擇角色權限"
                class="border border-light"
                :class="{ 'bg-secondary text-tertiary': true }"
                pt:input:class="text-sm pr-0 pl-2 py-1.5"
                pt:input:trigger="scale-[0.8] w-8"
                pt:input:panel="text-sm"
                :pt="{
                  input: () => ({
                    class: [{ 'text-tertiary': true }],
                  }),
                }"
              ></Dropdown>
            </div>
            <div class="h-12 flex items-center">
              <Button
                class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-dark-200"
              >
                <img
                  :src="addMemberIcon"
                  alt="add-member"
                  class="translate-x-[0.75px]"
                />
              </Button>
            </div>
          </ScrollPanel>
          <!-- footer -->
          <div class="h-[42px] flex items-center justify-end px-2">
            <Button
              class="px-2 py-1 bg-primary text-white hover:bg-primary-hover"
            >
              儲存
            </Button>
          </div>
        </div>
      </OverlayPanel>
    </div>
    <!-- completion -->
    <div class="w-[86px]" :class="{ 'text-tertiary': ownTasks }">
      <div v-if="ownTasks" class="border border-transparent p-1">
        {{
          typeof data.finished_percentage === "object"
            ? data.finished_percentage.totalDays
              ? Math.round(
                  (data.finished_percentage.completedDays /
                    data.finished_percentage.totalDays) *
                    100
                ) + "%"
              : "0%"
            : ""
        }}
      </div>
      <input
        v-else-if="isMilestone"
        type="checkbox"
        class="ml-1 cursor-pointer"
        v-model="inputBoolean"
        @change="updateCompletion"
      />
      <template v-else>
        <input
          type="text"
          class="w-12 h-6 p-1 bg-transparent border border-transparent outline-none rounded hover:border-light hover:bg-white focus:border-primary focus:bg-white"
          :class="{ 'hover:!border-primary': isSelected }"
          v-model="inputValue"
          @focus="selectContent"
          @blur="updateCompletion"
          @keydown.enter="blur"
          @keydown.esc="blur"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  watch,
  watchEffect,
  nextTick,
  onBeforeMount,
  onUnmounted,
} from "vue";
import { useRoute, useRouter } from "vue-router";
// import { useAuthStore } from '@/stores/auth';
import { useScheduleStore } from "@/stores/schedule";
import type {
  Project,
  Milestone,
  Section,
  Task,
  Comment,
} from "@/types/schedule";
import draggable from "vuedraggable";
import EditableCell from "@/components/schedule/EditableCell.vue";
import { nanoid } from "nanoid";
import { countWorkDays } from "@/utils/schedule";
// import {
//   createTask,
//   updateTask,
//   updateMultiTasks,
//   convertTask,
//   updateAssignees,
//   getDetail,
//   deleteTask,
//   postComment,
//   editComment,
//   deleteComment,
//   deleteCommentFile,
// } from "@/api/schedule";
import { useToast } from "primevue/usetoast";
import { useDebounceFn } from "@vueuse/core";
import { localToUTC } from "@/utils";

// icon
const collapseIcon = new URL("@/assets/icons/collapse.svg", import.meta.url)
  .href;
const searchIcon = new URL("@/assets/icons/search.svg", import.meta.url).href;
const addMemberIcon = new URL("@/assets/icons/add-member.svg", import.meta.url)
  .href;
const list2Icon = new URL("@/assets/icons/list2.svg", import.meta.url).href;
const unviewIcon = new URL("@/assets/icons/unview.svg", import.meta.url).href;
const view2Icon = new URL("@/assets/icons/view2.svg", import.meta.url).href;
const deleteIcon = new URL("@/assets/icons/delete.svg", import.meta.url).href;
const attachedIcon = new URL("@/assets/icons/attached.svg", import.meta.url)
  .href;
const ellipsisIcon = new URL("@/assets/icons/ellipsis.svg", import.meta.url)
  .href;
const addIcon = new URL("@/assets/icons/add.svg", import.meta.url).href;
const returnIcon = new URL("@/assets/icons/return.svg", import.meta.url).href;
const imageIcon = new URL("@/assets/icons/image.svg", import.meta.url).href;
const editIcon = new URL("@/assets/icons/edit.svg", import.meta.url).href;
const closeIcon = new URL("@/assets/icons/close.svg", import.meta.url).href;
const checkIcon = new URL("@/assets/icons/check.svg", import.meta.url).href;

// init
const props = defineProps<{
  parent_id: string;
  data: Section | Task | Milestone;
  rowIndex: string;
  dragCollapse: boolean;
  workDays: {
    is_work_day: boolean;
    name: string;
  }[];
  members: {
    department: string;
    employee_id: number;
    is_builder: boolean;
    name: string;
    role_level: number;
  }[];
  isShow: boolean;
}>();
const toast = useToast();
const emit = defineEmits(["collapse", "enableDrag", "disableDrag"]);
const { project } = useScheduleStore();
const store = useScheduleStore();
// const authStore = useAuthStore();
const trace = computed(() => {
  return props.rowIndex.split("-");
});
const parentData = computed(() => {
  let current: Section | Task = project.sections[Number(trace.value[0])];
  for (let i = 1; i < trace.value.length - 1; i++) {
    current = current.tasks[Number(trace.value[i])] as Task;
  }
  return current;
});
const currentData = computed<Section | Task | Milestone>(() => {
  let current: any = project.sections[Number(trace.value[0])];
  for (let i = 1; i < trace.value.length; i++) {
    current = current.tasks[Number(trace.value[i])];
  }
  return current;
});
const isSection = computed((): boolean => {
  return props.data.type == "section";
});
const isMilestone = computed((): boolean => {
  return props.data.type == "milestone";
});

onBeforeMount(() => {
  // 把後端的 date string 轉 +8 Date 格式
  let start_date = props.data.start_date
    ? new Date(props.data.start_date)
    : undefined;
  let end_date = props.data.end_date
    ? new Date(props.data.end_date)
    : undefined;
  currentData.value.start_date = start_date;
  currentData.value.end_date = end_date;
});

const isMounted = ref<boolean>(false);
onMounted(() => {
  // enter自動生成後開啟命名且內容為空(不然排序會重新掛載又開啟命名)
  if (isSelected.value) {
    rename(true);
  }
  isMounted.value = true;
});

// 更新 hashTable 表格
watchEffect(() => {
  if (isMounted.value && store.inheritInfo.childId == props.data.id) {
    store.hashTable.set(props.data.id, {
      index: "0-" + props.rowIndex,
      start_date: props.data.start_date,
      end_date: props.data.end_date,
      type: props.data.type,
      ownTasks: ownTasks.value,
      isShow: props.isShow,
      height: props.data.height,
    });
  }
});

// API
const createTaskAPI = async (
  projectId: string,
  updateParams: {
    parent_id: string;
    type?: "section" | "task" | "milestone";
    name?: string;
    start_date?: Date;
    end_date?: Date;
    after?: string;
    subsequences?: string[];
  }
): Promise<void> => {
  // try {
  //   store.selectedRowId = "";
  //   createTaskAPICompleted.value = false;
  //   const data: any = await createTask(projectId, updateParams);
  //   currentData.value.id = data.id;
  // } catch {
  //   toast.add({
  //     severity: "error",
  //     summary: "error",
  //     detail: "新增失敗",
  //     closable: false,
  //     life: 3000,
  //   });
  //   deleteRow();
  // } finally {
  //   createTaskAPICompleted.value = true;
  // }
};

const updateTaskAPI = async (
  projectId: string,
  taskId: string,
  updateParams: {
    is_collapsed?: boolean;
    parent_id?: string;
    name?: string;
    description?: string;
    before?: string;
    after?: string;
    start_date?: Date;
    end_date?: Date;
    finished_percentage?: number;
    todos?: { isFinished: boolean; value: string; id: string }[];
    dependencies?: string[];
    subsequences?: string[];
  }
): Promise<void> => {
  // try {
  //   await updateTask(projectId, taskId, updateParams);
  // } catch {
  //   toast.add({
  //     severity: "error",
  //     summary: "error",
  //     detail: "更新失敗",
  //     closable: false,
  //     life: 3000,
  //   });
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 3000);
  // }
};

const debouncedUpdateTaskAPI = useDebounceFn(
  (deepCopyOfProjectId: string, isCollapsed: boolean) => {
    updateTaskAPI(deepCopyOfProjectId, props.data.id, {
      is_collapsed: isCollapsed,
    });
  },
  800
);

const updateMultiTasksAPI = async (
  projectId: string,
  updateList: {
    id: string;
    parent_id?: string;
    name?: string;
    description?: string;
    start_date?: Date;
    end_date?: Date;
    finished_percentage?: number;
    todos?: { isFinished: boolean; value: string; id: string }[];
  }[]
): Promise<void> => {
  // try {
  //   await updateMultiTasks(projectId, updateList);
  // } catch {
  //   toast.add({
  //     severity: "error",
  //     summary: "error",
  //     detail: "更新失敗",
  //     closable: false,
  //     life: 3000,
  //   });
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 3000);
  // }
};

const updateAssigneesAPI = async (
  projectId: string,
  taskId: string,
  assignees: {
    assignees: number[];
  }
): Promise<void> => {
  // try {
  //   await updateAssignees(projectId, taskId, assignees);
  // } catch {
  //   toast.add({
  //     severity: "error",
  //     summary: "error",
  //     detail: "更新失敗",
  //     closable: false,
  //     life: 3000,
  //   });
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 3000);
  // }
};

const postCommentAPI = async (
  projectId: string,
  taskId: string,
  form: FormData
) => {
  // try {
  //   const data = await postComment(projectId, taskId, form);
  //   toast.add({
  //     severity: "success",
  //     summary: "success",
  //     detail: "新增留言成功",
  //     closable: false,
  //     life: 3000,
  //   });
  //   return data;
  // } catch {
  //   toast.add({
  //     severity: "error",
  //     summary: "error",
  //     detail: "更新失敗",
  //     closable: false,
  //     life: 3000,
  //   });
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 3000);
  // }
};

const editCommentAPI = async (discussionId: string, content: string) => {
  // try {
  //   await editComment(store.project.id, props.data.id, discussionId, content);
  //   toast.add({
  //     severity: "success",
  //     summary: "success",
  //     detail: "編輯留言成功",
  //     closable: false,
  //     life: 3000,
  //   });
  // } catch {
  //   toast.add({
  //     severity: "error",
  //     summary: "error",
  //     detail: "刪除留言失敗",
  //     closable: false,
  //     life: 3000,
  //   });
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 3000);
  // }
};

const deleteCommentAPI = async (discussionId: string, commentIndex: number) => {
  // try {
  //   discussion.value.splice(commentIndex, 1);
  //   await deleteComment(store.project.id, props.data.id, discussionId);
  //   toast.add({
  //     severity: "success",
  //     summary: "success",
  //     detail: "刪除留言成功",
  //     closable: false,
  //     life: 3000,
  //   });
  // } catch {
  //   toast.add({
  //     severity: "error",
  //     summary: "error",
  //     detail: "刪除留言失敗",
  //     closable: false,
  //     life: 3000,
  //   });
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 3000);
  // }
};

const deleteFileAPI = async (
  discussionId: string,
  commentIndex: number,
  fileId: string,
  fileIndex: number
) => {
  // try {
  //   discussion.value[commentIndex].files.splice(fileIndex, 1);
  //   await deleteCommentFile(
  //     store.project.id,
  //     props.data.id,
  //     discussionId,
  //     fileId
  //   );
  //   toast.add({
  //     severity: "success",
  //     summary: "success",
  //     detail: "刪除檔案成功",
  //     closable: false,
  //     life: 3000,
  //   });
  // } catch {
  //   toast.add({
  //     severity: "error",
  //     summary: "error",
  //     detail: "刪除檔案失敗",
  //     closable: false,
  //     life: 3000,
  //   });
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 3000);
  // }
};

const deleteTaskAPI = async (): Promise<void> => {
  // try {
  //   await deleteTask(store.project.id, props.data.id);
  //   store.hashTable.delete(props.data.id);
  // } catch (error) {
  //   toast.add({
  //     severity: "error",
  //     summary: "error",
  //     detail: "刪除失敗",
  //     closable: false,
  //     life: 3000,
  //   });
  //   // 復原數據
  //   revertDeleteRow(props.data);
  // }
};

const convertTaskAPI = async (type: "copy" | "milestone"): Promise<any> => {
  // try {
  //   store.isFetching = true;
  //   const data = await convertTask(store.project.id, props.data.id, type);
  //   return data;
  // } catch (error) {
  //   const detail = type == "copy" ? "複製失敗" : "轉換失敗";
  //   toast.add({
  //     severity: "error",
  //     summary: "error",
  //     detail: detail,
  //     closable: false,
  //     life: 3000,
  //   });
  // } finally {
  //   store.isFetching = false;
  // }
};

// collapse
const collapse = () => {
  const deepCopyOfProjectId: string = JSON.parse(
    JSON.stringify(store.project.id)
  );
  debouncedUpdateTaskAPI(
    deepCopyOfProjectId,
    !(props.data as Section | Task).is_collapsed
  );
  emit("collapse");
};

// select, unselect
const isSelected = computed((): boolean => {
  return store.selectedRowId === props.data.id;
});

// setting
const opSetting = ref();

const openSetting = (event: Event): void => {
  opSetting.value.toggle(event);
};

const upgrade = (): void => {
  const spliceIndex: number = Number(trace.value[trace.value.length - 2]) + 1;
  let grandParent: Section | Task = project.sections[Number(trace.value[0])];
  for (let i = 1; i < trace.value.length - 2; i++) {
    grandParent = grandParent.tasks[Number(trace.value[i])] as Task;
  }

  grandParent.tasks.splice(spliceIndex, 0, props.data as Task | Milestone);
  deleteRow(false);

  updateTaskAPI(store.project.id, props.data.id, {
    parent_id: grandParent.id,
    after: grandParent.tasks[spliceIndex - 1].id,
  });
};

const downgrade = (): void => {
  const formerTaskIndex: number =
    Number(trace.value[trace.value.length - 1]) - 1;
  (parentData.value.tasks[formerTaskIndex] as Task).tasks.push(
    props.data as Task | Milestone
  );
  deleteRow(false);

  updateTaskAPI(store.project.id, props.data.id, {
    parent_id: parentData.value.tasks[formerTaskIndex].id,
    after: (parentData.value.tasks[formerTaskIndex] as Task).tasks[
      (parentData.value.tasks[formerTaskIndex] as Task).tasks.length - 2
    ]?.id,
  });
};

const showSidePanel = ref<boolean>(false);
const discussion = ref<Comment[]>([]);
const openSidePanel = async () => {
  // showSidePanel.value = true;
  // try {
  //   const data: any = await getDetail(store.project.id, props.data.id);
  //   discussion.value = data.discussion as Comment[];
  // } catch {
  //   toast.add({
  //     severity: "error",
  //     summary: "error",
  //     detail: "獲取失敗",
  //     closable: false,
  //     life: 3000,
  //   });
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 3000);
  // }
};

const dateArray = ref<(Date | null)[]>([]); // side panel 內的日期需要是 array
const setDateArray = (
  dataArray: Date | Date[] | (Date | null)[] | null | undefined
): void => {
  if (dataArray == null || !(dataArray instanceof Array)) {
    return;
  }

  let start_date = dataArray[0] == null ? undefined : dataArray[0];
  let end_date = dataArray[1] == null ? undefined : dataArray[1];

  // 調成 UTC 00:00:000
  if (start_date) {
    start_date = localToUTC(start_date as Date);
  }
  if (end_date) {
    end_date = localToUTC(end_date as Date);
  }

  currentData.value.start_date = start_date;
  currentData.value.end_date = end_date;

  updateTaskAPI(store.project.id, props.data.id, {
    start_date: start_date,
    end_date: end_date,
  });
};
// 更新 dateArray
watchEffect(() => {
  if (props.data.start_date) {
    dateArray.value[0] = props.data.start_date;
  } else {
    dateArray.value[0] = null;
  }

  if (props.data.end_date) {
    dateArray.value[1] = props.data.end_date;
  } else {
    dateArray.value[1] = null;
  }
});

const createTaskAPICompleted = ref<boolean>(true);
async function waitForAPI(): Promise<void> {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (createTaskAPICompleted.value) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100); // 每100毫秒檢查一次
  });
}

const addTask = async (): Promise<void> => {
  // 當使用者按 "enter" 新增任務時，須等到前一個任務新增完畢後才可以執行
  await waitForAPI();
  if (opSetting.value) {
    opSetting.value.hide();
  }

  const traceEndVariable = isSection.value ? 2 : 1;
  const spliceIndex = isSection.value
    ? 0
    : Number(trace.value[trace.value.length - 1]) + 1;
  let current: Section | Task = project.sections[Number(trace.value[0])];
  for (let i = 1; i < trace.value.length - traceEndVariable; i++) {
    current = current.tasks[Number(trace.value[i])] as Task;
  }

  const tempId = "temp" + nanoid();
  const task: Task = {
    name: "",
    start_date: undefined,
    end_date: undefined,
    duration_in_days: undefined,
    assignees: [],
    finished_percentage: 0,
    tasks: [],
    id: tempId,
    type: "task",
    is_collapsed: false,
    description: "",
    dependencies: [],
    subsequences: [],
    todos: [],
    isHovered: false,
    height: 1,
    occupiedRow: 1,
    isAssignedToCurrentUser: false,
  };

  if (isSection.value) {
    current.tasks.push(task);
  } else {
    current.tasks.splice(spliceIndex, 0, task);
  }

  store.selectedRowId = tempId;
};

const isWatchingTasks = ref<boolean>(false); // 監視繼承依賴的子任務是否有被新增
const tempId = ref<string>("");
const addSubtask = (): void => {
  opSetting.value.hide();
  // 讓子任務繼承當前任務屬性: 日期，依賴(僅第一位子任務)
  let duration =
    props.data.start_date && props.data.end_date
      ? (props.data.end_date.getTime() - props.data.start_date.getTime()) /
          (1000 * 60 * 60 * 24) +
        1
      : undefined;
  tempId.value = "temp" + nanoid();
  const task: Task = {
    name: "",
    start_date: props.data.start_date,
    end_date: props.data.end_date,
    duration_in_days: duration,
    assignees: [],
    finished_percentage: 0,
    tasks: [],
    id: tempId.value,
    type: "task",
    is_collapsed: false,
    description: "",
    dependencies: [],
    subsequences: (props.data as Task).subsequences,
    todos: [],
    isHovered: false,
    height: 1,
    occupiedRow: 1,
    isAssignedToCurrentUser: false,
  };

  (currentData.value as Task).tasks.push(task);
  store.selectedRowId = tempId.value;

  // 第一個新增的子任務才需開起監視
  if ((props.data as Task).tasks.length == 1) {
    isWatchingTasks.value = true;

    // 更新其他任務的依賴
    store.inheritInfo.parentId = props.data.id;
    store.inheritInfo.childId = tempId.value;
  }
};

// 判斷子任務有無新增成功並繼承接續任務後
watchEffect(() => {
  if (isWatchingTasks.value) {
    if (props.data.type == "task") {
      // 沒有成功新增任務，回到上一動
      if (props.data.tasks.length == 0) {
        store.inheritInfo.parentId = tempId.value;
        store.inheritInfo.childId = props.data.id;
        return;
      }
      // 繼承接續任務的子任務成功新增
      else if (!props.data.tasks[0].id.startsWith("temp")) {
        // 清空父任務不需要的資訊
        nextTick(() => {
          updateTaskAPI(store.project.id, props.data.id, {
            start_date: props.data.start_date,
            end_date: props.data.end_date,
            finished_percentage: 0,
            subsequences: [],
          });
          updateAssigneesAPI(store.project.id, props.data.id, {
            assignees: [],
          });
        });
        if (currentData.value.type != "section") {
          currentData.value.subsequences = [];
        }
        memberList.value.forEach((el) => (el.isSelected = false));

        // 修改其他任務的依賴任務
        store.inheritInfo.parentId = tempId.value;
        store.inheritInfo.childId = props.data.tasks[0].id;

        // 已成功增新任務，關閉監聽
        isWatchingTasks.value = false;
      }
    }
  }
});

const addMilestone = (): void => {
  opSetting.value.hide();
  const traceEndVariable = isSection.value ? 2 : 1;
  const spliceIndex = isSection.value
    ? 0
    : Number(trace.value[trace.value.length - 1]) + 1;
  let current: Section | Task = project.sections[Number(trace.value[0])];
  for (let i = 1; i < trace.value.length - traceEndVariable; i++) {
    current = current.tasks[Number(trace.value[i])] as Task;
  }

  const tempId = "temp" + nanoid();
  const milestone: Milestone = {
    name: "里程碑",
    start_date: undefined,
    end_date: undefined,
    duration_in_days: undefined,
    assignees: [],
    finished_percentage: false,
    id: tempId,
    type: "milestone",
    description: "",
    todos: [],
    dependencies: [],
    subsequences: [],
    isHovered: false,
    height: 1,
    is_collapsed: false,
    occupiedRow: 1,
    isAssignedToCurrentUser: false,
  };

  if (isSection.value) {
    current.tasks.push(milestone);
  } else {
    current.tasks.splice(spliceIndex, 0, milestone);
  }
  store.selectedRowId = tempId;
};

const turnTaskIntoMilestone = (): void => {
  opSetting.value.hide();
  convertTaskAPI("milestone");

  let parent: Section | Task = project.sections[Number(trace.value[0])];
  for (let i = 1; i < trace.value.length - 1; i++) {
    parent = parent.tasks[Number(trace.value[i])] as Task;
  }

  const { id } = props.data as Task;
  store.updatedDateList.clear();
  store.enableUpdateMultiTasks = true;
  currentData.value.end_date = undefined;
  nextTick(() => {
    store.enableUpdateMultiTasks = false;
    const updatedDateList = Array.from(store.updatedDateList.values());
    if (updatedDateList.length) {
      updateMultiTasksAPI(store.project.id, updatedDateList);
    }
  });
  currentData.value.duration_in_days = undefined;
  currentData.value.finished_percentage = false;
  currentData.value.id = id;
  currentData.value.type = "milestone";
};

const editingName = ref(false);
const rename = (isEditing: boolean): void => {
  if (opSetting.value) {
    opSetting.value.hide();
  }
  editingName.value = isEditing;
};

const copyRow = async (): Promise<void> => {
  opSetting.value.hide();
  const data = await convertTaskAPI("copy");
  if (!data) return;
  if (isSection.value) {
    project.sections.splice(Number(trace.value[0]) + 1, 0, data as Section);
  } else {
    parentData.value.tasks.splice(
      Number(trace.value[trace.value.length - 1]) + 1,
      0,
      data as Task | Milestone
    );
  }
};

const deleteRow = (isRealDelete: boolean = true): void => {
  if (opSetting.value) {
    opSetting.value.hide();
  }

  // 砍數據
  if (trace.value.length == 1) {
    project.sections.splice(Number(trace.value[0]), 1);
  } else {
    parentData.value.tasks.splice(
      Number(trace.value[trace.value.length - 1]),
      1
    );
  }

  store.selectedRowId = "";
  // 用來更新他人接續任務資料，只有真的要刪除才執行，如果是搬遷資料中途的刪除不執行
  if (isRealDelete) {
    store.deletedRowId = props.data.id;
  }
};

const revertDeleteRow = (data: Section | Task | Milestone): void => {
  editingName.value = false;
  if (trace.value.length == 1) {
    project.sections.splice(Number(trace.value[0]), 0, data as Section);
  } else {
    parentData.value.tasks.splice(
      Number(trace.value[trace.value.length - 1]),
      0,
      data as Task | Milestone
    );
  }
};

// select member
const opMember = ref();
const memberList = ref<
  {
    department: string;
    employee_id: number;
    is_builder: boolean;
    name: string;
    role_level: number;
    isSelected: boolean;
  }[]
>([]);
// 因 WS 引起的直接更新要連帶更新 memberList 的選取
watch(
  () => {
    if (props.data.type == "task" || props.data.type == "milestone") {
      return props.data.assignees;
    }
  },
  () => {
    memberList.value.forEach((member) => {
      member.isSelected = (props.data as Task | Milestone).assignees
        .map((el) => el.id)
        .includes(member.employee_id);
    });
  }
);

watch(
  () => props.members,
  () => {
    memberList.value = props.members.map((member) => {
      if (props.data.type == "section") {
        return { ...member, isSelected: false };
      } else {
        return {
          ...member,
          isSelected: props.data.assignees
            .map((el) => el.id)
            .includes(member.employee_id),
        };
      }
    });
  },
  {
    deep: true,
    immediate: true,
  }
);
const openMemberPanel = (event: Event): void => {
  opMember.value.toggle(event);
};

const selectAllMembers = (event: Event): void => {
  if (event.target) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      memberList.value.forEach((member) => {
        member.isSelected = true;
      });
    } else {
      memberList.value.forEach((member) => {
        member.isSelected = false;
      });
    }
  }
};

const slideIn = ref<boolean>(false);
const saveMember = (): void => {
  opMember.value.hide();
  if (currentData.value.type == "task") {
    const filteredList = memberList.value.filter((member) => member.isSelected);
    currentData.value.assignees = filteredList.map((member) => ({
      id: member.employee_id,
    }));
    updateAssigneesAPI(store.project.id, props.data.id, {
      assignees: filteredList.map((member) => member.employee_id),
    });
  }
};

const addSubsequence = (): void => {
  const list = (props.data as Task | Milestone).subsequences;
  if (list.length == 0) {
    (currentData.value as Task | Milestone).subsequences.push("");
  } else if (list[list.length - 1] == "" || list[list.length - 1] == null) {
    return;
  } else {
    (currentData.value as Task | Milestone).subsequences.push("");
  }
};

const deleteSubsequence = (index: number): void => {
  (currentData.value as Task | Milestone).subsequences.splice(index, 1);

  updateTaskAPI(store.project.id, props.data.id, {
    subsequences: (props.data as Task | Milestone).subsequences,
  });
};
const hiddenFinishedTodos = ref<boolean>(false);
const dragTodo = ref<boolean>(false);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const addTodo = (idx?: number, event?: Event): void => {
  const index = idx == undefined ? props.data.todos.length : idx + 1;
  const newId = nanoid();
  currentData.value.todos.splice(index, 0, {
    isFinished: false,
    value: "",
    id: newId,
  });

  nextTick(() => {
    document.getElementById(`${newId}`)?.focus();
  });
};

const addTodoWhileNotEmpty = (event: Event, index: number): void => {
  const target = event.target as HTMLInputElement;
  target.blur();
  if (props.data.todos[index].value) {
    addTodo(index);
  }
};

const deleteTodo = (index: number): void => {
  currentData.value.todos.splice(index, 1);
};

const dragTodoStart = (event: DragEvent): void => {
  const dataTransfer: DataTransfer = event.dataTransfer as DataTransfer;
  dataTransfer.setData("text/plain", "dummy text"); // preventing firefox from doing nothing when data is empty
  const img = new Image();
  dataTransfer.setDragImage(img, 0, 0);
};

// 更新 todos
watch(
  () => props.data.todos,
  () => {
    updateTaskAPI(store.project.id, props.data.id, {
      todos: props.data.todos,
    });
  },
  { deep: true }
);

const dragFilesEnter = (event: DragEvent): void => {
  //   const target = event.target as HTMLDivElement;
  //   target.classList.add("!border-primary", "bg-primary-50", "text-primary-3");
  // };
  // const dragFilesLeave = (event: DragEvent): void => {
  //   const target = event.target as HTMLDivElement;
  //   target.classList.remove("!border-primary", "bg-primary-50", "text-primary-3");
  // };
  // let limit = ref<number>(10485760); // 10 * 1024 * 1024 Byte
  // const fileInputOne = ref<HTMLInputElement>();
  // const uploadInputtedFiles = async (event: Event) => {
  //   const target = event.target as HTMLInputElement;
  //   if (!target.files) return;
  //   const files = Array.from(
  //     { length: target.files.length as number },
  //     (_, i) => target.files?.[i]
  //   );
  //   if (files.length == 0) return;
  //   // 超過10MB
  //   const totalSize = files.reduce((acc, cur) => {
  //     if (cur) {
  //       acc += cur.size;
  //     }
  //     return acc;
  //   }, 0);
  //   if (totalSize > limit.value) {
  //     toast.add({
  //       severity: "error",
  //       summary: "error",
  //       detail: "文件大小超過限制",
  //       closable: false,
  //       life: 3000,
  //     });
  //     return;
  //   }
  //   const form = new FormData();
  //   if (files) {
  //     files.forEach((file) => {
  //       form.append("files[]", file as File);
  //     });
  //   }
  //   const res = await postCommentAPI(store.project.id, props.data.id, form);
  //   if (!res) return;
  //   discussion.value.push(res.data);
};

const uploadDroppedFiles = async (event: DragEvent): Promise<void> => {
  // event.preventDefault();
  // const dataTransfer = event.dataTransfer;
  // const files = Array.from(
  //   { length: dataTransfer?.files.length as number },
  //   (_, i) => dataTransfer?.files[i]
  // );
  // if (files.length == 0) return;
  // // 超過10MB
  // const totalSize = files.reduce((acc, cur) => {
  //   if (cur) {
  //     acc += cur.size;
  //   }
  //   return acc;
  // }, 0);
  // 11;
  // if (totalSize > limit.value) {
  //   toast.add({
  //     severity: "error",
  //     summary: "error",
  //     detail: "文件大小超過限制",
  //     closable: false,
  //     life: 3000,
  //   });
  //   return;
  // }
  // const form = new FormData();
  // if (files) {
  //   files.forEach((file) => {
  //     form.append("files[]", file as Blob);
  //   });
  // }
  // const target = event.target as HTMLDivElement;
  // target.classList.remove("!border-primary", "bg-primary-50", "text-primary-3");
  // const res = await postCommentAPI(store.project.id, props.data.id, form);
  // if (!res) return;
  // discussion.value.push(res.data);
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const time = date.toTimeString().split(" ")[0];

  return `${year}/${month}/${day} ${time}`;
};

const adjustHeight = (event: Event): void => {
  const target = event.target as HTMLTextAreaElement;
  target.style.height = "auto";
  target.style.height = target.scrollHeight + "px";
};

const commentContent = ref<string>("");
const fileInputTwo = ref<HTMLInputElement>();
const fileList = ref<File[]>([]);
const selectFile = () => {
  fileInputTwo.value?.click();
};

const saveFilesToFileList = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;
  const files = Array.from(
    { length: target.files.length as number },
    (_, i) => target.files?.[i]
  );

  if (files.length == 0) return;
  files.forEach((el) => {
    if (!el) return;
    fileList.value.push(el);
  });

  target.value = "";
};

const sendMessage = async (): Promise<void> => {
  // const form = new FormData();
  // form.append("content", commentContent.value);
  // fileList.value.forEach((el) => {
  //   form.append("files[]", el);
  // });
  // const res = await postCommentAPI(store.project.id, props.data.id, form);
  // if (!res) return;
  // discussion.value.push(res.data);
  // // init
  // fileList.value = [];
  // commentContent.value = "";
};

// watch subtasks' date + update start_date and end_date
const ownTasks = computed((): boolean => {
  if (props.data.type == "section") {
    return true;
  } else if (props.data.type == "task") {
    return props.data.tasks.length > 0;
  } else {
    return false;
  }
});

const computedStartDate = computed((): Date | undefined => {
  if (ownTasks.value) {
    return (props.data as Section | Task).tasks.reduce(
      (min: Date | undefined, cur) => {
        if (cur.type == "milestone") {
          if (!(cur.start_date instanceof Date)) {
            return min;
          } else {
            if (min === undefined) {
              return cur.start_date;
            } else {
              return cur.start_date.getTime() < min.getTime()
                ? cur.start_date
                : min;
            }
          }
        } else {
          if (
            !(cur.start_date instanceof Date) ||
            !(cur.end_date instanceof Date)
          ) {
            return min;
          } else {
            if (min === undefined) {
              return cur.start_date;
            } else {
              return cur.start_date.getTime() < min.getTime()
                ? cur.start_date
                : min;
            }
          }
        }
      },
      undefined
    );
  }
  return props.data.start_date;
});

const computedEndDate = computed((): Date | undefined => {
  if (ownTasks.value) {
    return (props.data as Section | Task).tasks.reduce(
      (max: Date | undefined, cur) => {
        // milestone 要用起始日期抓
        if (cur.type == "milestone") {
          if (!(cur.start_date instanceof Date)) {
            return max;
          } else {
            if (max === undefined) {
              return cur.start_date;
            } else {
              return cur.start_date.getTime() > max.getTime()
                ? cur.start_date
                : max;
            }
          }
        } else {
          if (
            !(cur.start_date instanceof Date) ||
            !(cur.end_date instanceof Date)
          ) {
            return max;
          } else {
            if (max === undefined) {
              return cur.end_date;
            } else {
              return (cur.end_date as Date).getTime() > max.getTime()
                ? cur.end_date
                : max;
            }
          }
        }
      },
      undefined
    );
  }
  return props.data.end_date;
});

// update date for 父任務
watchEffect(() => {
  if (!ownTasks.value) return;
  currentData.value.start_date = computedStartDate.value;
  currentData.value.end_date = computedEndDate.value;
});

// set updatedDateList
watch([() => props.data.start_date, () => props.data.end_date], () => {
  if (store.enableUpdateMultiTasks) {
    store.updatedDateList.set(props.data.id, {
      id: props.data.id,
      start_date: props.data.start_date,
      end_date: props.data.end_date,
    });
  }
});

watch(
  () => ownTasks.value,
  (newValue, oldValue) => {
    // 從任務變父集
    if (newValue == true && oldValue == false) {
      // 復原組件輸入值
      inputValue.value = "0%";
      inputBoolean.value = false;

      // 繼承父任務 subsequences
      if (isWatchingTasks.value) return;
      // 如果是新增的第一個子任務就繼承父任務的依賴
      if (currentData.value.type == "task") {
        if (currentData.value.tasks.length == 1) {
          let heir = currentData.value.tasks[0];
          if (heir.type == "task") {
            while (heir.tasks.length) {
              heir = heir.tasks[0];
              if (heir.type == "milestone") {
                break;
              }
            }
          }

          // 繼承父任務依賴，並排除自己
          nextTick(() => {
            if (currentData.value.type != "task") return;
            heir.subsequences = [
              ...new Set([
                ...heir.subsequences.filter((subId) => {
                  return !store.hashTable.get(subId)?.ownTasks;
                }),
                ...currentData.value.subsequences.filter(
                  (subId) => subId != heir.id
                ),
              ]),
            ];
            updateTaskAPI(store.project.id, heir.id, {
              subsequences: heir.subsequences,
            });
            // 更新其他任務 subsequences 中的此任務
            store.inheritInfo.parentId = props.data.id;
            store.inheritInfo.childId = heir.id;
          });
        }
      }

      //清空接續任務與成員並更新
      nextTick(() => {
        updateTaskAPI(store.project.id, props.data.id, {
          start_date: props.data.start_date,
          end_date: props.data.end_date,
          finished_percentage: 0,
          subsequences: [],
        });
        updateAssigneesAPI(store.project.id, props.data.id, {
          assignees: [],
        });

        if (currentData.value.type != "section") {
          currentData.value.subsequences = [];
        }
        memberList.value.forEach((el) => (el.isSelected = false));
      });
    }

    // 從父集變任務
    if (newValue == false && oldValue == true) {
      currentData.value.finished_percentage = 0;
    }
  }
);

// set row duration_in_days
watchEffect(() => {
  if (props.data.start_date && props.data.end_date) {
    currentData.value.duration_in_days = countWorkDays(
      props.data.start_date,
      props.data.end_date,
      props.workDays
    );
  } else {
    currentData.value.duration_in_days = undefined;
  }
});

// drag
const enableDrag = (): void => {
  if (isSection.value) {
    store.isDragging = "Section";
    return;
  }
  store.isDragging = "Others";
  emit("enableDrag");

  // 防止點下去不拖曳物件導致其他功能失效
  setTimeout(() => {
    if (!store.dragData) {
      store.isDragging = undefined;
      emit("disableDrag");
    }
  }, 300);
};

const atTop = computed((): boolean => {
  if (store.dragoverPosition === "top") {
    const currentIndex = store.projectSequence.findIndex(
      (el) => el.id == store.dragoverId
    );
    if (currentIndex == 0 || currentIndex == -1) {
      return false;
    } else {
      return (
        props.data.id ==
        store.projectSequence[
          store.projectSequence.findIndex((el) => el.id == store.dragoverId) - 1
        ].id
      );
    }
  }
  return false;
});
const atMiddle = computed((): boolean => {
  if (
    store.dragoverPosition === "middle" &&
    props.data.id == store.dragoverId
  ) {
    return true;
  } else {
    return false;
  }
});
const atBottom = computed((): boolean => {
  if (
    store.dragoverPosition === "bottom" &&
    props.data.id == store.dragoverId
  ) {
    return true;
  } else {
    return false;
  }
});

const dragenter = (event: DragEvent): void => {
  if (store.isDragging != "Others") return;

  const offsetY = event.offsetY;
  const containerHeight = (event.target as HTMLElement).clientHeight;
  // 確定滑鼠位置在容器的哪個部分
  if (offsetY < containerHeight / 2) {
    store.dragoverPosition = "top";
  } else {
    store.dragoverPosition = "bottom";
  }

  event.preventDefault(); // 不加上這個會導致進入元素時顯示 none droppable
  store.dragoverId = props.data.id;
  store.dragoverTrace = trace.value;
};

// 用於修改css顯示預計放置位置
const dragover = (event: DragEvent): void => {
  if (store.isDragging != "Others") return;

  event.preventDefault();
  const offsetY = event.offsetY;
  const containerHeight = (event.target as HTMLElement).clientHeight;

  if (isSection.value) {
    store.dragoverPosition = "bottom";
    return;
  }
  // 確定滑鼠位置在容器的哪個部分
  if (offsetY < containerHeight / 3) {
    store.dragoverPosition = "top";
  } else if (offsetY < (containerHeight / 3) * 2) {
    store.dragoverPosition = "middle";
  } else {
    store.dragoverPosition = "bottom";
  }
};

// 用於修改數據
const drop = (event: DragEvent): void => {
  event.preventDefault();
  if (store.isDragging != "Others") return;

  // dnd on the same item
  if (store.dragTrace.join("-") == props.rowIndex) return;

  // put it on section
  if (isSection.value) {
    // 複製原始數據至目的地
    (currentData.value as Task).tasks.unshift(
      store.dragData as Task | Milestone
    );

    // 修改待刪除之原始數據座標
    if (trace.value.every((el, index) => el == store.dragTrace[index])) {
      store.dragTrace[trace.value.length] = (
        Number(store.dragTrace[trace.value.length]) + 1
      ).toString();
    }

    // 發API
    if (!store.dragData) return;
    if (store.dragData.type != "section") {
      nextTick(() => {
        if (!store.dragData) return;
        updateTaskAPI(store.project.id, store.dragData.id, {
          parent_id: props.data.id,
          before: (props.data as Section).tasks[1]?.id,
        });
      });
    }
  }
  // put it on tasks or milestone
  else {
    const offsetY = event.offsetY;
    const containerHeight = (event.target as HTMLElement).clientHeight;
    // 放在當前任務同層級前一
    if (offsetY < containerHeight / 3) {
      // 複製原始數據至目的地
      const spliceIndex = Number(trace.value[trace.value.length - 1]);
      parentData.value.tasks.splice(
        spliceIndex,
        0,
        store.dragData as Task | Milestone
      );

      // 修改待刪除之原始數據座標
      // 同層級後方任何任務跟當前子任務往前移動都會導致原始拖曳物件需要刪除的軌跡(store.dragTrace)改變
      if (
        trace.value.every((el, index) => {
          // 最後一個
          if (index == trace.value.length - 1) {
            // 子任務或是後方任務
            return Number(store.dragTrace[index]) >= Number(trace.value[index]);
          }
          return el == store.dragTrace[index];
        })
      ) {
        store.dragTrace[trace.value.length - 1] = (
          Number(store.dragTrace[trace.value.length - 1]) + 1
        ).toString();
      }

      // 發API
      if (!store.dragData) return;
      if (store.dragData.type != "section") {
        nextTick(() => {
          if (!store.dragData) return;
          updateTaskAPI(store.project.id, store.dragData.id, {
            parent_id: parentData.value.id,
            before: props.data.id,
          });
        });
      }
    }
    // 放在當前任務裡第一
    else if (offsetY < (containerHeight / 3) * 2) {
      // milestone 沒有子任務
      if (isMilestone.value) {
        return;
      }

      // 複製原始數據至目的地
      (currentData.value as Task).tasks.unshift(
        store.dragData as Task | Milestone
      );

      // 修改待刪除之原始數據座標
      // 子任務往父任務內移動會導致原始拖曳物件的刪除軌跡(store.dragTrace)改變
      if (trace.value.every((el, index) => el == store.dragTrace[index])) {
        store.dragTrace[trace.value.length] = (
          Number(store.dragTrace[trace.value.length]) + 1
        ).toString();
      }

      // 發API
      if (!store.dragData) return;
      if (store.dragData.type != "section") {
        nextTick(() => {
          if (!store.dragData) return;
          updateTaskAPI(store.project.id, store.dragData.id, {
            parent_id: props.data.id,
            before: (props.data as Task).tasks[1]?.id,
          });
        });
      }
    }
    // 放在當前任務同層級後一
    else {
      // 複製原始數據至目的地
      const spliceIndex = Number(trace.value[trace.value.length - 1]) + 1;
      parentData.value.tasks.splice(
        spliceIndex,
        0,
        store.dragData as Task | Milestone
      );

      // 修改待刪除之原始數據座標
      // 同層級後方任何任務跟當前子任務往前移動都會導致原始拖曳物件需要刪除的軌跡(store.dragTrace)改變
      if (
        //後方任務
        trace.value.every((el, index) => {
          if (index == trace.value.length - 1) {
            return Number(store.dragTrace[index]) > Number(trace.value[index]);
          }
          return el == store.dragTrace[index];
        })
      ) {
        store.dragTrace[trace.value.length - 1] = (
          Number(store.dragTrace[trace.value.length - 1]) + 1
        ).toString();
      }

      // 發API
      if (!store.dragData) return;
      if (store.dragData.type != "section") {
        nextTick(() => {
          if (!store.dragData) return;
          updateTaskAPI(store.project.id, store.dragData.id, {
            parent_id: parentData.value.id,
            after: props.data.id,
          });
        });
      }
    }
  }

  // delete drag row
  let parent: Section | Task = project.sections[Number(store.dragTrace[0])];
  for (let i = 1; i < store.dragTrace.length - 1; i++) {
    parent = parent.tasks[Number(store.dragTrace[i])] as Task;
  }
  parent.tasks.splice(Number(store.dragTrace[store.dragTrace.length - 1]), 1);
};

// completion
const completionRate = computed(
  (): { completedDays: number; totalDays: number } | number => {
    if (ownTasks.value) {
      const completedDays = (props.data as Section | Task).tasks.reduce(
        (acc, cur) => {
          // task 就+完工天數
          if (cur.type == "task") {
            if (typeof cur.finished_percentage == "object") {
              return acc + cur.finished_percentage.completedDays;
            } else {
              return (
                acc +
                (cur.duration_in_days || 0) * (cur.finished_percentage / 100)
              );
            }
          }
          // milestone 不納入計算
          else {
            return acc;
          }
        },
        0
      );

      const totalDays = (props.data as Section | Task).tasks.reduce(
        (acc, cur) => {
          // task 就+duration_in_days
          if (cur.type == "task") {
            if (cur.tasks.length > 0) {
              return (
                acc +
                (
                  cur.finished_percentage as {
                    completedDays: number;
                    totalDays: number;
                  }
                ).totalDays
              );
            } else {
              return acc + (cur.duration_in_days || 0);
            }
          }
          // milestone 不納入計算
          else {
            return acc;
          }
        },
        0
      );

      return { completedDays, totalDays };
    }

    // 沒任務
    return props.data.finished_percentage as number;
  }
);

watchEffect(() => {
  // 更新完成率
  currentData.value.finished_percentage = completionRate.value;

  // 更新 input value
  if (!isMounted.value) return;
  if (ownTasks.value) return;
  inputValue.value = (completionRate.value as number).toString() + "%";
});

const selectContent = (event: Event) => {
  const target = event.target as HTMLInputElement;
  target.select();
};

const blur = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  target.blur();
};

const inputValue = ref<string>("");
const inputBoolean = ref<boolean>(
  props.data.finished_percentage ? true : false
);
const updateCompletion = (event: Event): void => {
  if (isMilestone.value) {
    const target = event.target as HTMLInputElement;
    updateTaskAPI(store.project.id, props.data.id, {
      finished_percentage: target.checked ? 1 : 0,
    });

    if (target.checked) {
      currentData.value.finished_percentage = true;
      inputBoolean.value = true;
    } else {
      currentData.value.finished_percentage = false;
      inputBoolean.value = false;
    }
  } else {
    let value = Number(
      (event.target as HTMLInputElement).value.replace(/%$/, "")
    );
    value = isNaN(value)
      ? 0
      : (value = Math.min(Math.max(Math.round(value), 0), 100));
    updateTaskAPI(store.project.id, props.data.id, {
      finished_percentage: value,
    });

    if (isNaN(value)) {
      currentData.value.finished_percentage = 0;
      inputValue.value = 0 + "%";
    } else {
      currentData.value.finished_percentage = value;
      inputValue.value = value + "%";
    }
  }
};

const updateDescription = (event: Event) => {
  const target = event.target as HTMLInputElement;
  updateTaskAPI(store.project.id, props.data.id, {
    description: target.value,
  });
};

const occupiedRow = computed((): number => {
  if (store.filterSelf) {
    if (props.data.isAssignedToCurrentUser) {
      if (ownTasks.value) {
        return props.data.is_collapsed
          ? 1
          : (props.data as Section | Task).tasks.reduce((acc, cur) => {
              return acc + cur.occupiedRow;
            }, 1) + (props.data.type == "section" ? 1 : 0);
      } else {
        return 1 + (props.data.type == "section" ? 1 : 0);
      }
    }
    return 0;
  } else {
    if (ownTasks.value) {
      return props.data.is_collapsed
        ? 1
        : (props.data as Section | Task).tasks.reduce((acc, cur) => {
            return acc + cur.occupiedRow;
          }, 1) + (props.data.type == "section" ? 1 : 0);
    } else {
      return 1 + (props.data.type == "section" ? 1 : 0);
    }
  }
});

watch(
  () => occupiedRow.value,
  () => {
    currentData.value.occupiedRow = occupiedRow.value || 0;
  },
  { immediate: true }
);

const height = computed((): number => {
  let sum = 0;
  let access: Project | Section | Task | Milestone = store.project;
  trace.value.forEach((level, levelIndex) => {
    // section
    if (levelIndex == 0) {
      for (let i = 0; i <= Number(level); i++) {
        if (i == Number(level)) {
          sum++;
          access = (access as Project).sections[i];
          break;
        } else {
          sum += (access as Project).sections[i].occupiedRow;
        }
      }
    }
    // and beyond
    else {
      for (let i = 0; i <= Number(level); i++) {
        if (i == Number(level)) {
          sum++;
          access = (access as Section | Task).tasks[i];
          break;
        } else {
          sum += (access as Section | Task).tasks[i].occupiedRow;
        }
      }
    }
  });

  return sum;
});

watch(
  () => height.value,
  () => {
    currentData.value.height = height.value || 0;
  },
  { immediate: true }
);

// 接續任務若被刪除，也要更新 subsequences
watch(
  () => store.deletedRowId,
  () => {
    if (props.data.type == "section") return;
    if (props.data.subsequences) {
      if (props.data.subsequences.includes(store.deletedRowId)) {
        (currentData.value as Task | Milestone).subsequences.splice(
          props.data.subsequences.indexOf(store.deletedRowId),
          1
        );
        updateTaskAPI(store.project.id, props.data.id, {
          subsequences: props.data.subsequences,
        });
      }
    }
  }
);

// 修改被繼承的接續任務
watch(
  () => [store.inheritInfo.parentId, store.inheritInfo.childId],
  () => {
    if (!store.inheritInfo.parentId) return;
    if (props.data.id == store.inheritInfo.childId) return;
    if (props.data.type != "section") {
      const index = props.data.subsequences.indexOf(store.inheritInfo.parentId);
      if (index != -1) {
        if (store.inheritInfo.childId) {
          (currentData.value as Task | Milestone).subsequences.splice(
            index,
            1,
            store.inheritInfo.childId
          );
          if (store.inheritInfo.childId.startsWith("temp")) return;
          updateTaskAPI(store.project.id, props.data.id, {
            subsequences: (currentData.value as Task | Milestone).subsequences,
          });
        } else {
          (currentData.value as Task | Milestone).subsequences.splice(index, 1);
          updateTaskAPI(store.project.id, props.data.id, {
            subsequences: (currentData.value as Task | Milestone).subsequences,
          });
        }
      }
    }
  }
);
</script>

<style scoped>
/* 反選樣式 */
input:focus::selection {
  background-color: #bde7fa;
  color: #1d2939;
}

/* 適用於 Firefox 瀏覽器 */
input:focus::-moz-selection {
  background-color: #bde7fa;
  color: #1d2939;
}

input[type="checkbox"]:checked {
  accent-color: #0b95d0;
}

input {
  outline: none;
}
</style>
