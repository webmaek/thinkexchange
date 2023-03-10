import { Box, Container, Grid, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { MainLayout } from "~/components/layouts/MainLayout";
import { Feed } from "~/components/project/Feed";
import { NotFoundState } from "~/components/project/NotFoundState";
import { api } from "~/utils/api";
import { useScrollPosition } from "~/utils/hooks/useScrollPosition";

export function SearchView() {
  const router = useRouter();

  const { q } = router.query as { q: string };

  const scrollPosition = useScrollPosition();

  const {
    data,
    isLoading: isFeedLoading,
    hasNextPage,
    isFetching,
    fetchNextPage,
    refetch,
  } = api.project.useFeed(
    {
      limit: 5,
      query: q,
    },
    {
      enabled: q !== undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const projects = data?.pages.flatMap((page) => page.projects) ?? [];

  useEffect(() => {
    if (scrollPosition > 95 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);

  useEffect(() => {
    refetch();
  }, [router.query?.q, refetch]);

  return (
    <MainLayout showLoader={isFeedLoading}>
      <Container size="lg" mt={20}>
        <Grid gutter={10}>
          <Grid.Col span={3}></Grid.Col>
          <Grid.Col span={6}>
            <Box>
              <Text fz="xl" color="gray.8" fw={500}>
                Search results for: {router.query?.q}
              </Text>

              <Box mt={20}>
                <Feed data={projects} />
                {!hasNextPage && projects.length > 0 && <NotFoundState />}
              </Box>
            </Box>
          </Grid.Col>
        </Grid>
      </Container>
    </MainLayout>
  );
}
