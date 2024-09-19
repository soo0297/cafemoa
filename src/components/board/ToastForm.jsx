import { useCallback, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import _ from 'lodash';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/toastui-editor.css';
import { supabase, supabaseUrl } from '../../supabase/supabase';
import Map from './Map';
import { DATA_API } from '../../api/api';
import getNowDate from '../../utils/getNowDate';
import { useUpdatePost } from '../../queries/boardQueries';
import FormInput from './FormInput';
import { categoryList } from '../../data/category';

const toolbar = [['heading', 'bold', 'italic', 'strike'], ['hr', 'quote', 'ul', 'ol'], ['image']];

const initialState = {
  category: categoryList[0],
  title: '',
  content: '',
  author_id: '',
  date: '',
  cafe_address: '',
  region: '',
};

function TuiEditor({ content, isEdit = false }) {
  const [postId] = useState(crypto.randomUUID());
  const [post, setPost] = useState(content || initialState);
  const [cafeData, setCafeData] = useState({ cafe_address: content?.cafe_address || '' });
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const nowPostId = searchParams.get('post_id');
  const updatePost = useUpdatePost();

  // 카테고리, 타이틀 관리
  const changeValue = e => {
    const { id, value } = e.target;
    setPost({ ...post, [id]: value });
  };

  // 토스트 에디터 관리
  const handleEditorChange = () => {
    const contentData = editorRef.current.getInstance().getHTML();
    setPost({ ...post, content: contentData });
  };

  // supabase로 업로드 이미지 관리
  const handleImage = async (file, callback) => {
    const { data, error } = await supabase.storage.from('posts').upload(`${postId}/${Date.now()}`, file);
    if (error) {
      console.error('Image upload failed:', error.message);
      return;
    }
    callback(`${supabaseUrl}/storage/v1/object/public/${data.fullPath}`);
  };
  const editorRef = useRef();

  // 카페 정보 관리
  const handleCafeData = useCallback(
    _.debounce(info => setCafeData(info), 1000),
    [],
  );
  const changeCafeInfo = e => {
    const { id, value } = e.target;
    handleCafeData({ [id]: value });
  };

  // 데이터 전송
  const handleOnSubmit = () => {
    if (!post.title) {
      alert('타이틀을 입력해주세요');
      return;
    }
    if (!post.content) {
      alert('내용을 입력해주세요');
      return;
    }
    if (!post.cafe_address) {
      alert('카페 주소를 입력해주세요');
      return;
    }
    if (!post.cafe_name) {
      alert('카페 상호명을 입력해주세요');
      return;
    }
    const createResult = async post => {
      await DATA_API.post('/articles', post);
      navigate(`/detail?post_id=${postId}`);
    };

    const updateResult = () => {
      updatePost.mutate({ id: nowPostId, post: { ...post } });
      navigate(`/detail?post_id=${nowPostId}`);
    };

    {
      isEdit ? updateResult({ post }) : createResult({ ...post, id: postId, date: getNowDate() });
    }
  };

  return (
    <>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleOnSubmit();
        }}
        className="flex flex-col gap-6 max-w-screen-xl mx-auto"
      >
        <div className="flex items-center gap-4">
          <label htmlFor="title">제목</label>
          <select name="category" id="category" value={post.category} onChange={e => changeValue(e)}>
            {categoryList.map(category => {
              return (
                <option key={category} value={category}>
                  {category}
                </option>
              );
            })}
          </select>

          <FormInput
            type={'text'}
            name={'title'}
            value={post.title || ''}
            onChange={e => {
              changeValue(e);
            }}
          />
        </div>

        <Editor
          initialValue={post.content || ' '}
          initialEditType="wysiwyg"
          autofocus={false}
          ref={editorRef}
          toolbarItems={toolbar}
          hideModeSwitch
          height="500px"
          hooks={{
            addImageBlobHook: handleImage,
          }}
          onChange={handleEditorChange}
        />

        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center w-full md:w-[calc(50%-8px)] gap-4">
            <label htmlFor="cafe_name">카페 이름</label>

            <FormInput
              type={'text'}
              name={'cafe_name'}
              value={post.cafe_name || ''}
              onChange={e => {
                changeValue(e);
              }}
            />
          </div>

          <div className="flex items-center w-full md:w-[calc(50%-8px)] gap-4">
            <label htmlFor="cafe_address">카페 주소</label>
            <FormInput
              type={'text'}
              name={'cafe_address'}
              value={post.cafe_address || ''}
              onChange={e => {
                changeValue(e);
                changeCafeInfo(e);
              }}
            />
          </div>

          <Map cafeData={cafeData} post={post} setPost={setPost} />
        </div>

        <button type="submit">{isEdit ? '수정' : '등록'}</button>
      </form>
    </>
  );
}

export default TuiEditor;