import SpotListItem from '../components/SpotListItem';
import { useState, useEffect } from 'react';
import { DATA_API } from '../api/api';

const List = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 8;

  const [endIndex, setEndIndex] = useState(8);

  console.log('articles', articles);

  // 스크롤 이벤트
  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 10 &&
      hasMore &&
      !loading
    ) {
      setEndIndex(prevIndex => prevIndex + itemsPerPage);
    }
  };

  // 컴포넌트가 처음 로드될 때 , 페이지가 바뀔때마다 실행
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const { data } = await DATA_API.get(`/articles?_limit=${endIndex}`);
        if (itemsPerPage < data.length) {
          setHasMore(false);
        }
        setArticles(data);
      } catch (error) {
        console.error('Error', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [endIndex]);

  // 스크롤 이벤트 추가
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // 컴포넌트가 언마운트 될 때 이벤트 제거
  }, [loading, hasMore]);
  //추후 IntersectionObserver 로 변경하기,,

  return (
    <div>
      <button
        onClick={() => {
          let articleData = [...articles];
          articleData.sort((a, b) => (a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1));
          setArticles(articleData);
        }}
      >
        가나다순
      </button>
      <button
        onClick={() => {
          let articleData = [...articles];
          articleData.sort((a, b) => new Date(b.date) - new Date(a.date));
          setArticles(articleData);
        }}
      >
        최신순
      </button>
      <ul className="grid grid-cols-4 sm:grid-cols-2">
        {articles.map((article, index) => {
          return <SpotListItem key={index} data={article} />;
        })}
      </ul>
      {loading && <div>Loading...</div>}
    </div>
  );
};
export default List;
